import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const { id: kit_id } = await params;
    const body = await request.json();
    const { component_id, expected_quantity } = body;

    if (!component_id || expected_quantity === undefined) {
      return errorResponse('VALIDATION_ERROR', 'Missing required fields', undefined, 400);
    }

    const qty = parseInt(expected_quantity);
    if (qty <= 0) {
      return errorResponse('VALIDATION_ERROR', 'Expected quantity must be positive', undefined, 400);
    }

    // Upsert kit component
    const res = await pool.query(`
      INSERT INTO kit_components (id, kit_id, component_id, expected_quantity)
      VALUES (gen_random_uuid(), $1, $2, $3)
      ON CONFLICT (kit_id, component_id) 
      DO UPDATE SET expected_quantity = $3
      RETURNING *
    `, [kit_id, component_id, qty]);

    await pool.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'UPDATE', 'kits', $2)
    `, [session.userId, `Updated component ${component_id} in kit ${kit_id} to qty ${qty}`]);

    return successResponse(res.rows[0]);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23503') { // foreign key violation
      return errorResponse('VALIDATION_ERROR', 'Invalid kit or component reference', undefined, 400);
    }
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
