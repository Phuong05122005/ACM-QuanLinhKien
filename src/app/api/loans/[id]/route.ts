import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const isAdmin = session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN');
    const { id } = await params;

    const loanRes = await pool.query(`
      SELECT l.*, u.username as student_name
      FROM loans l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `, [id]);

    if (loanRes.rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Loan not found', undefined, 404);
    }

    const loan = loanRes.rows[0];

    if (!isAdmin && loan.user_id !== session.userId) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const itemsRes = await pool.query(`
      SELECT li.*, c.name as component_name, k.name as kit_name
      FROM loan_items li
      LEFT JOIN components c ON li.component_id = c.id
      LEFT JOIN kits k ON li.kit_id = k.id
      WHERE li.loan_id = $1
    `, [id]);

    loan.items = itemsRes.rows;

    const historyRes = await pool.query(`
      SELECT h.*, u.username as changed_by_name
      FROM loan_status_histories h
      JOIN users u ON h.changed_by = u.id
      WHERE h.loan_id = $1
      ORDER BY h.created_at ASC
    `, [id]);

    loan.history = historyRes.rows;

    const scanRes = await pool.query(`SELECT id FROM ai_scans WHERE loan_id =  ORDER BY created_at DESC LIMIT 1`, [id]);
    if (scanRes.rows.length > 0) loan.latest_scan_id = scanRes.rows[0].id;

    return successResponse(loan);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
