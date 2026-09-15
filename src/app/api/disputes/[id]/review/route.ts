import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { DisputeService } from '@/lib/dispute/service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const { id: disputeId } = await params;
    const body = await request.json();
    const { status, resolution } = body;

    try {
      const dispute = await DisputeService.reviewDispute(disputeId, session.userId, status, resolution);
      return successResponse(dispute);
    } catch(e: unknown) { 
//error: any) {
      return errorResponse('VALIDATION_ERROR', (e !== null && typeof e === 'object' && 'code' in e) ? 'Database error occurred' : (e instanceof Error ? (e.message || 'Unknown error') : 'Unknown error'), undefined, 400);
    }
  } catch(e: unknown) { 
//error: any) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
