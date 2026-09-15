import { clearSession, getSession } from '@/lib/auth';
import { pool } from '@/lib/pg';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST() {
  try {
    const session = await getSession();
    
    if (session) {
      await pool.query(`
        INSERT INTO audit_logs (id, user_id, action, resource, details)
        VALUES (gen_random_uuid(), $1, 'LOGOUT', 'auth', 'User logged out')
      `, [session.userId]);
    }

    await clearSession();

    return successResponse({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
