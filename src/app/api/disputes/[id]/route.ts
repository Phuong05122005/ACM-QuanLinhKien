import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { pool } from '@/lib/pg';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const isAdmin = session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN');
    const { id } = await params;

    const res = await pool.query(`SELECT * FROM disputes WHERE id = $1`, [id]);
    if (res.rows.length === 0) return errorResponse('NOT_FOUND', 'Dispute not found', undefined, 404);

    const dispute = res.rows[0];
    if (!isAdmin && dispute.user_id !== session.userId) {
      return errorResponse('FORBIDDEN', 'Access denied', undefined, 403);
    }

    const evidenceRes = await pool.query(`SELECT * FROM dispute_evidences WHERE dispute_id = $1 ORDER BY created_at ASC`, [id]);
    dispute.evidences = evidenceRes.rows;

    return successResponse(dispute);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
