import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const queryParts: string[] = [];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      queryParts.push(`(k.name ILIKE $${paramIndex} OR k.kit_code ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';

    const dataQuery = `
      SELECT k.id, k.name, k.description, k.kit_code as code, 'AVAILABLE' as status, true as is_active, 
        COALESCE(
          MIN(FLOOR(c.available_quantity / NULLIF(kc.quantity, 0))),
          0
        ) as available_kits_count
      FROM kits k
      LEFT JOIN kit_components kc ON k.id = kc.kit_id
      LEFT JOIN components c ON kc.component_id = c.id
      ${whereClause}
      GROUP BY k.id
      ORDER BY k.name ASC
    `;
    
    const dataRes = await pool.query(dataQuery, queryParams);

    return successResponse(dataRes.rows);
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
    const { name, description, code } = body;

    if (!name || !code) {
      return errorResponse('VALIDATION_ERROR', 'Missing required fields', undefined, 400);
    }

    const res = await pool.query(`
      INSERT INTO kits (id, name, description, kit_code)
      VALUES (gen_random_uuid(), $1, $2, $3)
      RETURNING id, name, description, kit_code as code, 'AVAILABLE' as status, true as is_active
    `, [name, description || '', code]);

    await pool.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'CREATE', 'kits', $2)
    `, [session.userId, `Created kit ${code}`]);

    return successResponse(res.rows[0], 201);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') {
      return errorResponse('VALIDATION_ERROR', 'Kit code already exists', undefined, 400);
    }
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
