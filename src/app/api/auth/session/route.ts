import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse('UNAUTHORIZED', 'No active session', undefined, 401);
    }
    
    return successResponse(session);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
