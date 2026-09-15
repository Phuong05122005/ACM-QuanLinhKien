import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { transitionLoanState } from '@/lib/loan/service';
import { LoanState, Role } from '@/lib/loan/loan.state-machine';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const isAdmin = session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN');
    const role: Role = isAdmin ? 'ADMIN' : 'STUDENT';

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse('VALIDATION_ERROR', 'Target status required', undefined, 400);
    }

    try {
      const loan = await transitionLoanState(id, status as LoanState, session.userId, role);
      return successResponse(loan);
    } catch(e: unknown) { 
//error: any) {
      return errorResponse('VALIDATION_ERROR', (e !== null && typeof e === 'object' && 'code' in e) ? 'Database error occurred' : (e instanceof Error ? (e.message || 'Unknown error') : 'Unknown error'), undefined, 400);
    }
  } catch(e: unknown) { 
//error: any) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
