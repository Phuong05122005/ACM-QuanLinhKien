import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'name'; // name, created_at, available_quantity
    const offset = (page - 1) * limit;

    const queryParts = ['1=1'];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      queryParts.push(`(name ILIKE $${paramIndex} OR identifier ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      queryParts.push(`category_id = $${paramIndex}`);
      queryParams.push(categoryId);
      paramIndex++;
    }

    let orderBy = 'name ASC';
    if (sort === 'created_at') orderBy = 'created_at DESC';
    if (sort === 'available_quantity') orderBy = 'available_quantity DESC';

    const countQuery = `SELECT COUNT(*) FROM components WHERE ${queryParts.join(' AND ')}`;
    const countRes = await pool.query(countQuery, queryParams);
    const total = parseInt(countRes.rows[0].count);

    const dataQuery = `
      SELECT c.*, cat.name as category_name
      FROM components c
      LEFT JOIN component_categories cat ON c.category_id = cat.id
      WHERE ${queryParts.join(' AND ')}
      ORDER BY c.${orderBy}
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

    const body = await request.json();
    const { name, category_id, total_quantity, identifier } = body;

    if (!name || !category_id || !identifier) {
      return errorResponse('VALIDATION_ERROR', 'Missing required fields', undefined, 400);
    }
    
    const qty = parseInt(total_quantity) || 0;
    if (qty < 0) {
      return errorResponse('VALIDATION_ERROR', 'Quantity cannot be negative', undefined, 400);
    }

    const res = await pool.query(`
      INSERT INTO components (id, name, category_id, total_quantity, available_quantity, identifier, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $3, $4, NOW())
      RETURNING *
    `, [name, category_id, qty, identifier]);

    await pool.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'CREATE', 'components', $2)
    `, [session.userId, `Created component ${identifier}`]);

    return successResponse(res.rows[0], 201);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') { // unique violation
      return errorResponse('VALIDATION_ERROR', 'Identifier already exists', undefined, 400);
    }
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
