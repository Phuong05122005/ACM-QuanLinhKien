
import { pool } from '@/lib/pg';
import { successResponse, errorResponse } from '@/lib/api';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM component_categories ORDER BY name ASC');
    return successResponse(res.rows);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }
    const { name } = await request.json();
    const res = await pool.query('INSERT INTO component_categories (id, name) VALUES (gen_random_uuid(), $1) RETURNING *', [name]);
    return successResponse(res.rows[0], 201);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') return errorResponse('VALIDATION_ERROR', 'Category name already exists', undefined, 400);
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}

