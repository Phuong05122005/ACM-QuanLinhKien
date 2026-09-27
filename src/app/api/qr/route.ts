import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { generateQrCode } from '@/lib/qr/service';

import { pool } from '@/lib/pg';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }
    const res = await pool.query(`SELECT * FROM qr_codes ORDER BY id DESC LIMIT 100`);
    return successResponse(res.rows);
  } catch(e) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}

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
