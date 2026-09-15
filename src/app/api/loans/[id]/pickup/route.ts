import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { processPickup } from '@/lib/qr/service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const { id } = await params;
    const body = await request.json();
    const { qr_code } = body;

    if (!qr_code) {
      return errorResponse('VALIDATION_ERROR', 'QR Code is required', undefined, 400);
    }

    try {
      const loan = await processPickup(id, qr_code, session.userId);
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
