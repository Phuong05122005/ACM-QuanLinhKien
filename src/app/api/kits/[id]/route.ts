import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const kitRes = await pool.query(`
      SELECT k.id, k.name, k.description, k.kit_code as code, 'AVAILABLE' as status, true as is_active, 
        COALESCE(
          MIN(FLOOR(c.available_quantity / NULLIF(kc.quantity, 0))),
          0
        ) as available_kits_count
      FROM kits k
      LEFT JOIN kit_components kc ON k.id = kc.kit_id
      LEFT JOIN components c ON kc.component_id = c.id
      WHERE k.id = $1
      GROUP BY k.id
    `, [id]);

    if (kitRes.rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Kit not found', undefined, 404);
    }

    const kit = kitRes.rows[0];

    // Fetch components
    const componentsRes = await pool.query(`
      SELECT kc.kit_id || '-' || kc.component_id as kit_component_id, kc.quantity as expected_quantity, c.id as component_id, c.name, c.identifier, c.available_quantity
      FROM kit_components kc
      JOIN components c ON kc.component_id = c.id
      WHERE kc.kit_id = $1
      ORDER BY c.name ASC
    `, [id]);

    kit.components = componentsRes.rows;

    return successResponse(kit);
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
    const { name, description, code } = body;

    const res = await pool.query(`
      UPDATE kits 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          kit_code = COALESCE($3, kit_code)
      WHERE id = $4
      RETURNING id, name, description, kit_code as code, 'AVAILABLE' as status, true as is_active
    `, [name, description, code, id]);

    if (res.rows.length === 0) {
      return errorResponse('NOT_FOUND', 'Kit not found', undefined, 404);
    }

    await pool.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'UPDATE', 'kits', $2)
    `, [session.userId, `Updated kit ${id}`]);

    return successResponse(res.rows[0]);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') {
      return errorResponse('VALIDATION_ERROR', 'Kit code already exists', undefined, 400);
    }
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
