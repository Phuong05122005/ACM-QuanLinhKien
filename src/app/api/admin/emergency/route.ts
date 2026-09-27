import { successResponse, errorResponse } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { AuditService } from '@/lib/audit/service';
import { forceReturnLoan, forceInventorySync } from '@/lib/loan/service';
import { pool } from '@/lib/pg';

export async function POST(request: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN']);
    const body = await request.json();
    const { operation, loan_id, component_id, reason } = body;

    if (!reason || reason.length < 10) {
      return errorResponse('VALIDATION_ERROR', 'Lý do vận hành khẩn cấp phải chi tiết (ít nhất 10 ký tự)', undefined, 400);
    }

    let resultMsg = '';

    if (operation === 'FORCE_RETURN' && loan_id) {
      await forceReturnLoan(loan_id, session.userId, reason);
      resultMsg = `Forced RETURN for loan ${loan_id}`;
    } else if (operation === 'SYNC_INVENTORY' && component_id) {
      const syncRes = await forceInventorySync(component_id, session.userId, reason);
      resultMsg = `Inventory synchronized for component ${component_id}. New available: ${syncRes.expectedAvailable}`;
    } else {
      return errorResponse('VALIDATION_ERROR', 'Invalid operation or missing parameters', undefined, 400);
    }

    const client = await pool.connect();
    try {
      await AuditService.log(session.userId, 'EMERGENCY_OVERRIDE', 'system', `${resultMsg}. Reason: ${reason}`, client);
    } finally {
      client.release();
    }

    return successResponse({ message: resultMsg });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'FORBIDDEN' || err.message === 'UNAUTHORIZED') {
      return errorResponse(err.message, 'Forbidden', undefined, 403);
    }
    return errorResponse('SERVER_ERROR', err.message || 'Internal server error', undefined, 500);
  }
}

