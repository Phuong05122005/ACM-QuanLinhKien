import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { NotificationService } from '@/lib/notification/service';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const body = await request.json();
    const { notification_id } = body;

    await NotificationService.markAsRead(session.userId, notification_id);
    return successResponse({ message: 'Marked as read' });
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
