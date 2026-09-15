import { pool } from '@/lib/pg';

export async function generateQrCode(targetType: 'COMPONENT' | 'KIT', targetId: string, adminId: string) {
  const code = `QR-${targetType.substring(0, 4)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Inactivate existing QR codes for this target to ensure only one active
    await client.query(`
      UPDATE qr_codes SET is_active = false WHERE target_type = $1 AND target_id = $2
    `, [targetType, targetId]);

    const res = await client.query(`
      INSERT INTO qr_codes (id, target_type, target_id, code, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
      RETURNING *
    `, [targetType, targetId, code]);

    await client.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'CREATE', 'qr_codes', $2)
    `, [adminId, `Generated QR ${code} for ${targetType} ${targetId}`]);

    await client.query('COMMIT');
    return res.rows[0];
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function processPickup(loanId: string, qrCodeString: string, studentId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock loan
    const loanRes = await client.query(`
      SELECT * FROM loans WHERE id = $1 FOR UPDATE
    `, [loanId]);

    if (loanRes.rows.length === 0) {
      throw new Error('Loan not found');
    }

    const loan = loanRes.rows[0];

    // Ownership check
    if (loan.user_id !== studentId) {
      throw new Error('Unauthorized: wrong student');
    }

    // Idempotency check
    if (loan.status === 'BORROWED') {
      await client.query('COMMIT');
      return loan;
    }

    // State check
    if (loan.status !== 'READY_FOR_PICKUP') {
      throw new Error(`Invalid loan state for pickup: ${loan.status}`);
    }

    // Validate QR code
    const qrRes = await client.query(`
      SELECT * FROM qr_codes WHERE code = $1
    `, [qrCodeString]);

    if (qrRes.rows.length === 0) {
      throw new Error('QR code does not exist');
    }

    const qr = qrRes.rows[0];
    if (!qr.is_active) {
      throw new Error('QR code is inactive');
    }

    // Verify QR code target belongs to this loan
    const itemsRes = await client.query(`
      SELECT * FROM loan_items WHERE loan_id = $1
    `, [loanId]);

    const matchingItem = itemsRes.rows.find(
      (item) => (qr.target_type === 'KIT' && item.kit_id === qr.target_id) ||
                (qr.target_type === 'COMPONENT' && item.component_id === qr.target_id)
    );

    if (!matchingItem) {
      throw new Error('QR code does not match any items in this loan');
    }

    // Perform atomic state updates
    // 1. Update loan status
    const updateLoanRes = await client.query(`
      UPDATE loans SET status = 'BORROWED', updated_at = NOW() WHERE id = $1 RETURNING *
    `, [loanId]);

    // 2. If kit, update kit status to IN_USE
    if (qr.target_type === 'KIT') {
      await client.query(`
        UPDATE kits SET status = 'IN_USE', updated_at = NOW() WHERE id = $1
      `, [qr.target_id]);
    }

    // 3. Update loan history
    await client.query(`
      INSERT INTO loan_status_histories (id, loan_id, status, changed_by, notes, created_at)
      VALUES (gen_random_uuid(), $1, 'BORROWED', $2, 'Student picked up via QR scan', NOW())
    `, [loanId, studentId]);

    // 4. Audit log
    await client.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'PICKUP', 'loans', $2)
    `, [studentId, `Picked up loan ${loanId} with QR ${qrCodeString}`]);

    // 5. Notification
    await client.query(`
      INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
      VALUES (gen_random_uuid(), $1, 'Loan Picked Up', $2, false, NOW())
    `, [studentId, `You have successfully picked up loan ${loan.code}.`]);

    await client.query('COMMIT');
    return updateLoanRes.rows[0];
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
