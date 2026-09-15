import { pool } from '@/lib/pg';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM component_categories ORDER BY name ASC');
    return successResponse(res.rows);
  } catch (error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
