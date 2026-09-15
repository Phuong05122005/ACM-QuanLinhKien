import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { pool } from '@/lib/pg';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const res = await pool.query(`
      SELECT a.*, u.username 
      FROM audit_logs a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC 
      LIMIT $1
    `, [limit]);

    return successResponse(res.rows);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
