import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, componentId: string }> }) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const { id: kit_id, componentId: component_id } = await params;

    const res = await pool.query(`
      DELETE FROM kit_components
      WHERE kit_id = $1 AND component_id = $2
      RETURNING *
    `, [kit_id, component_id]);

    if (res.rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Component not found in kit', undefined, 404);
    }

    await pool.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'UPDATE', 'kits', $2)
    `, [session.userId, `Removed component ${component_id} from kit ${kit_id}`]);

    return successResponse({ message: 'Component removed from kit' });
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
