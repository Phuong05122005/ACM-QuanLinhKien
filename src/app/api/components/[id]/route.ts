import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await pool.query(`
      SELECT c.*, cat.name as category_name
      FROM components c
      LEFT JOIN component_categories cat ON c.category_id = cat.id
      WHERE c.id = $1
    `, [id]);

    if (res.rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Component not found', undefined, 404);
    }

    return successResponse(res.rows[0]);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { name, category_id, is_active } = body;

    const res = await pool.query(`
      UPDATE components 
      SET name = COALESCE($1, name),
          category_id = COALESCE($2, category_id),
          is_active = COALESCE($3, is_active),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [name, category_id, is_active, id]);

    if (res.rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Component not found', undefined, 404);
    }

    await pool.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'UPDATE', 'components', $2)
    `, [session.userId, `Updated component ${id}`]);

    return successResponse(res.rows[0]);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
