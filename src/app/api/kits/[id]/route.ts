import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const kitRes = await pool.query(`
      SELECT k.*, 
        COALESCE(
          MIN(FLOOR(c.available_quantity / NULLIF(kc.expected_quantity, 0))),
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
      SELECT kc.id as kit_component_id, kc.expected_quantity, c.id as component_id, c.name, c.identifier, c.available_quantity
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
    const { name, description, code, status, is_active } = body;

    const validStatuses = ['AVAILABLE', 'RESERVED', 'IN_USE', 'MAINTENANCE', 'INACTIVE'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid status', undefined, 400);
    }

    const res = await pool.query(`
      UPDATE kits 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          code = COALESCE($3, code),
          status = COALESCE($4, status),
          is_active = COALESCE($5, is_active),
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, description, code, status, is_active, id]);

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
