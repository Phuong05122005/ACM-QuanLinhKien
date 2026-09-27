import { pool } from '@/lib/pg';
import { successResponse, errorResponse } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { AuditService } from '@/lib/audit/service';

export async function GET(request: Request) {
  try {
    const session = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const res = await pool.query(`SELECT key, value FROM system_configs`);
    return successResponse(res.rows);
  } catch (error: unknown) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 403);
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const session = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const body = await request.json();
    
    if (!Array.isArray(body)) {
      return errorResponse('VALIDATION_ERROR', 'Expected an array of configs', undefined, 400);
    }

    await client.query('BEGIN');
    
    for (const config of body) {
      if (config.key && config.value !== undefined) {
        await client.query(`
          INSERT INTO system_configs (id, key, value, updated_at) 
          VALUES (gen_random_uuid(), $1, $2, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        `, [config.key, config.value.toString()]);
      }
    }

    await AuditService.log(session.userId, 'UPDATE', 'system_configs', 'Updated system configurations', client);

    await client.query('COMMIT');
    return successResponse({ success: true });
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  } finally {
    client.release();
  }
}
