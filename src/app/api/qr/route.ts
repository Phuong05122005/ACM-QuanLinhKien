import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { generateQrCode } from '@/lib/qr/service';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const body = await request.json();
    const { target_type, target_id } = body;

    if (!target_type || !['COMPONENT', 'KIT'].includes(target_type) || !target_id) {
      return errorResponse('VALIDATION_ERROR', 'Invalid or missing fields', undefined, 400);
    }

    const qr = await generateQrCode(target_type, target_id, session.userId);
    return successResponse(qr, 201);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
