import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { z } from 'zod';
import { validateRequest } from '@/lib/validation';

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateRequest(updateCategorySchema, body);
    if (!validation.success || !validation.data) return validation.response as Response;
    
    const { name, description } = validation.data;

    const res = await pool.query(`
      UPDATE component_categories
      SET name = COALESCE($1, name),
          description = COALESCE($2, description)
      WHERE id = $3
      RETURNING *
    `, [name ?? null, description ?? null, id]);

    if (res.rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Category not found', undefined, 404);
    }

    await pool.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'UPDATE', 'component_categories', $2)
    `, [session.userId, `Updated category ${id}`]);

    return successResponse(res.rows[0]);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') {
      return errorResponse('VALIDATION_ERROR', 'Category name already exists', undefined, 400);
    }
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
