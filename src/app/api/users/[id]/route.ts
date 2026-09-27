import { pool } from '@/lib/pg';
import { successResponse, errorResponse } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { AuditService } from '@/lib/audit/service';
import bcrypt from 'bcryptjs';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await pool.connect();
  try {
    const session = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const id = (await params).id;
    const body = await request.json();
    const { is_active, roles, password } = body;

    // Prevent modifying SUPER_ADMIN unless you are a SUPER_ADMIN
    const targetUserRoleRes = await client.query(`
      SELECT r.name FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `, [id]);
    const targetRoles = targetUserRoleRes.rows.map(r => r.name);
    
    if (targetRoles.includes('SUPER_ADMIN') && !session.roles.includes('SUPER_ADMIN')) {
      return errorResponse('FORBIDDEN', 'Cannot modify SUPER_ADMIN users', undefined, 403);
    }

    if (roles && roles.includes('SUPER_ADMIN') && !session.roles.includes('SUPER_ADMIN')) {
      return errorResponse('FORBIDDEN', 'Only SUPER_ADMIN can assign SUPER_ADMIN role', undefined, 403);
    }

    await client.query('BEGIN');

    // Update basic fields if provided
    if (typeof is_active === 'boolean') {
      await client.query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2', [is_active, id]);
    }

    // Update password if provided
    if (password) {
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      const hash = await bcrypt.hash(password, 10);
      await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, id]);
    }

    // Update roles if provided
    if (roles && Array.isArray(roles)) {
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      for (const roleName of roles) {
        const roleRes = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        if (roleRes.rows.length > 0) {
          await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [id, roleRes.rows[0].id]);
        }
      }
    }

    await AuditService.log(session.userId, 'UPDATE', 'users', `Updated user ${id}`, client);

    await client.query('COMMIT');
    return successResponse({ id });
  } catch (error: unknown) {
    const err = error as Error;
    await client.query('ROLLBACK');
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return errorResponse(err.message, 'Forbidden', undefined, 403);
    }
    return errorResponse('SERVER_ERROR', err.message || 'Internal server error', undefined, 500);
  } finally {
    client.release();
  }
}
