import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { pool } from '@/lib/pg';
import { transitionLoanState } from '@/lib/loan/service';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const body = await request.json();
    const { scan_id, decision, reason } = body; // decision: CONFIRM, CORRECT, REJECT

    if (!scan_id || !decision || !['CONFIRM', 'CORRECT', 'REJECT'].includes(decision)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid or missing fields', undefined, 400);
    }

    if (decision === 'CORRECT' && !reason) {
      return errorResponse('VALIDATION_ERROR', 'Reason is required for correction', undefined, 400);
    }

    const client = await pool.connect();
    let loanId = '';
    try {
      await client.query('BEGIN');
      
      const scanRes = await client.query(`SELECT loan_id FROM ai_scans WHERE id = $1`, [scan_id]);
      if (scanRes.rows.length === 0) throw new Error('Scan not found');
      loanId = scanRes.rows[0].loan_id;

      await client.query(`
        INSERT INTO ai_reviews (id, scan_id, reviewer_id, decision, reason, reviewed_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
      `, [scan_id, session.userId, decision, reason || '']);

      await client.query(`
        INSERT INTO audit_logs (id, user_id, action, resource, details)
        VALUES (gen_random_uuid(), $1, 'REVIEW', 'ai_scans', $2)
      `, [session.userId, `Admin ${decision} scan ${scan_id}. Reason: ${reason || 'N/A'}`]);

      await client.query('COMMIT');
    } catch(error: unknown) {
      await client.query('ROLLBACK');
      return errorResponse('VALIDATION_ERROR', (error as { code?: string }).code ? 'Database error occurred' : (((error as Error).message || 'Unknown error') || 'Unknown error'), undefined, 400);
    } finally {
      client.release();
    }

    // Now transition loan if approved (CONFIRM/CORRECT -> RETURNED)
    // If REJECT, they must return it again, or loan stays in RETURN_REQUIRES_INSPECTION?
    // Let's say CONFIRM/CORRECT transitions to RETURNED. REJECT transitions back to BORROWED or OVERDUE so they can resubmit?
    // Prompt says "Admin correction ... return completion". Let's assume CONFIRM and CORRECT finish the return.
    if (decision === 'CONFIRM' || decision === 'CORRECT') {
      const loan = await transitionLoanState(loanId, 'RETURNED', session.userId, 'ADMIN');
      return successResponse({ loan, message: `Review completed (${decision}) and loan returned.` });
    } else {
      // REJECT -> transition back to BORROWED so they can retry.
      // Wait, our state machine doesn't allow RETURN_REQUIRES_INSPECTION -> BORROWED.
      // Let's just leave it in RETURN_REQUIRES_INSPECTION if REJECTED, or we need to add an edge.
      // Actually, let's keep it simple: REJECT just records it. Admin must handle the rest manually (e.g. contact student).
      return successResponse({ message: `Review completed (${decision}). Loan remains in manual review state.` });
    }

  } catch(error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
