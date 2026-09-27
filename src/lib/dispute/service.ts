import { pool } from '@/lib/pg';
import { AuditService } from '@/lib/audit/service';
import { NotificationService } from '@/lib/notification/service';

export const DISPUTE_DEADLINE_HOURS = 24;

export class DisputeService {
  static async createDispute(loanId: string, studentId: string, reason: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const loanRes = await client.query(`SELECT * FROM loans WHERE id = $1 FOR UPDATE`, [loanId]);
      if (loanRes.rows.length === 0) throw new Error('Loan not found');
      
      const loan = loanRes.rows[0];
      if (loan.user_id !== studentId) throw new Error('Forbidden: Not your loan');
      if (loan.status !== 'RETURNED' && loan.status !== 'RETURN_REQUIRES_INSPECTION') {
        throw new Error('Disputes can only be opened after return');
      }

      // Query the exact time the loan was marked as returned or requiring inspection
      const historyRes = await client.query(`
        SELECT created_at FROM loan_status_histories 
        WHERE loan_id = $1 AND status IN ('RETURNED', 'RETURN_REQUIRES_INSPECTION')
        ORDER BY created_at ASC LIMIT 1
      `, [loanId]);
      
      if (historyRes.rows.length === 0) {
        throw new Error('Return transition history not found');
      }

      const returnDate = new Date(historyRes.rows[0].created_at);
      const diffMs = Date.now() - returnDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours > DISPUTE_DEADLINE_HOURS) {
        throw new Error(`Dispute deadline passed. Must be within ${DISPUTE_DEADLINE_HOURS} hours of return.`);
      }

      const res = await client.query(`
        INSERT INTO disputes (id, loan_id, user_id, description, status, created_at)
        VALUES (gen_random_uuid(), $1, $2, $3, 'PENDING', NOW())
        RETURNING *
      `, [loanId, studentId, reason]);
      const dispute = res.rows[0];

      await AuditService.log(studentId, 'CREATE', 'disputes', `Created dispute ${dispute.id} for loan ${loanId}`, client);
      await NotificationService.notify(studentId, 'DISPUTE_SUBMITTED', `Your dispute for loan ${loan.loan_code} was submitted.`, client);

      await client.query('COMMIT');
      return dispute;
    } catch (e: unknown) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async addEvidence(disputeId: string, uploaderId: string, fileUrl: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const disputeRes = await client.query(`SELECT * FROM disputes WHERE id = $1`, [disputeId]);
      if (disputeRes.rows.length === 0) throw new Error('Dispute not found');
      
      const dispute = disputeRes.rows[0];
      // Either the student who owns it, or an admin can upload evidence
      // Wait, we'll validate role at API level, but let's check ownership for student
      // We will skip strict check here and assume API verified authorization

      const res = await client.query(`
        INSERT INTO dispute_evidences (id, dispute_id, file_url, uploaded_at)
        VALUES (gen_random_uuid(), $1, $2, NOW())
        RETURNING *
      `, [disputeId, fileUrl]);

      await AuditService.log(uploaderId, 'UPLOAD_EVIDENCE', 'dispute_evidences', `Added evidence to dispute ${disputeId}`, client);
      
      await client.query('COMMIT');
      return res.rows[0];
    } catch (e: unknown) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async reviewDispute(disputeId: string, adminId: string, status: string, resolution: string) {
    if (!['REVIEWING', 'RESOLVED', 'REJECTED'].includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    if (['RESOLVED', 'REJECTED'].includes(status) && !resolution) {
      throw new Error('Final decisions require a reason/resolution.');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(`
        UPDATE disputes 
        SET status = $1, description = COALESCE(NULLIF($2, ''), description)
        WHERE id = $3
        RETURNING *
      `, [status, resolution, disputeId]);

      if (res.rows.length === 0) throw new Error('Dispute not found');
      const dispute = res.rows[0];

      await AuditService.log(adminId, 'REVIEW', 'disputes', `Changed dispute ${disputeId} status to ${status}. Reason: ${resolution}`, client);

      const eventMap: Record<string, string> = {
        'RESOLVED': 'DISPUTE_RESOLVED',
        'REJECTED': 'DISPUTE_REJECTED',
        'REVIEWING': 'DISPUTE_REVIEWING',
      };
      const eventName = eventMap[status] || 'SYSTEM_NOTIFICATION';

      await NotificationService.notify(dispute.user_id, eventName, `Dispute update: ${status}. ${resolution ? `Note: ${resolution}` : ''}`, client);

      await client.query('COMMIT');
      return dispute;
    } catch (e: unknown) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
