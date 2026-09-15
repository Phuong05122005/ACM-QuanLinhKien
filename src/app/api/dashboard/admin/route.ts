import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { DashboardService } from '@/lib/dashboard/service';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const data = await DashboardService.getAdminDashboard();
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
