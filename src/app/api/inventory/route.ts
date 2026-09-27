import { pool } from "@/lib/pg";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const queryParts = ['1=1'];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      queryParts.push(`(c.name ILIKE $${paramIndex} OR c.identifier ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) 
      FROM inventory_transactions t 
      JOIN components c ON t.component_id = c.id
      WHERE ${queryParts.join(' AND ')}
    `;
    const countRes = await pool.query(countQuery, queryParams);
    const total = parseInt(countRes.rows[0].count);

    const dataQuery = `
      SELECT t.*, c.name as component_name, c.identifier as component_identifier 
      FROM inventory_transactions t 
      JOIN components c ON t.component_id = c.id
      WHERE ${queryParts.join(' AND ')}
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataRes = await pool.query(dataQuery, [...queryParams, limit, offset]);

    return successResponse({
      items: dataRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
