import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { pool } from '@/lib/pg';
import { NotificationService } from '@/lib/notification/service';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const { title, message } = await request.json();
    if (!title || !message) {
      return errorResponse('VALIDATION_ERROR', 'Title and message are required', undefined, 400);
    }

    // Get all active users
    const usersRes = await pool.query(`SELECT id FROM users WHERE is_active = true`);
    
    // Broadcast notification
    for (const row of usersRes.rows) {
      await NotificationService.notify(row.id, title, message);
    }

    return successResponse({ 
      success: true, 
      sent_count: usersRes.rows.length 
    });
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
