import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { processInventoryTransaction } from '@/lib/inventory/service';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const body = await request.json();
    const { component_id, quantity_change, transaction_type, reference_id } = body;

    if (!component_id || quantity_change === undefined || !transaction_type) {
      return errorResponse('VALIDATION_ERROR', 'Missing required fields', undefined, 400);
    }

    const validTypes = ['STOCK_IN', 'STOCK_OUT', 'BORROW', 'RETURN', 'ADJUSTMENT', 'DAMAGE', 'MISSING', 'MANUAL_OVERRIDE'];
    if (!validTypes.includes(transaction_type)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid transaction type', undefined, 400);
    }

    const result = await processInventoryTransaction({
      componentId: component_id,
      quantityChange: parseInt(quantity_change),
      transactionType: transaction_type,
      referenceId: reference_id,
      userId: session.userId,
    });

    return successResponse({
      message: 'Transaction successful',
      available_quantity: result.available_quantity,
      total_quantity: result.total_quantity
    });
  } catch (error: unknown) {
    if ((error as { message?: string }).message === 'INSUFFICIENT_INVENTORY') {
      return errorResponse('VALIDATION_ERROR', 'Insufficient inventory', undefined, 400);
    }
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
