import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { pool } from '@/lib/pg';
import { NotificationService } from '@/lib/notification/service';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const res = await pool.query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 100
    `, [session.userId]);

    const unreadCount = await NotificationService.getUnreadCount(session.userId);

    return successResponse({ notifications: res.rows, unreadCount });
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
