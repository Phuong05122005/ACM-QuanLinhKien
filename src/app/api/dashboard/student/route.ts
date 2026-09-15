import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { DashboardService } from '@/lib/dashboard/service';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const data = await DashboardService.getStudentDashboard(session.userId);
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
