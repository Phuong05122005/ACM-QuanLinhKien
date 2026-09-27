import { pool } from '@/lib/pg';
import { successResponse, errorResponse } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { AuditService } from '@/lib/audit/service';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const session = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    
    // Fetch users with their roles
    const usersResult = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.email, u.student_code, u.is_active, u.locked_until,
             COALESCE(json_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '[]') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username ILIKE $1 OR u.full_name ILIKE $1 OR u.student_code ILIKE $1
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 100
    `, [`%${search}%`]);

    return successResponse(usersResult.rows);
  } catch (error: unknown) {
    return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 403);
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const session = await requireRole(['ADMIN', 'SUPER_ADMIN']);
    const body = await request.json();
    const { username, full_name, email, student_code, password, roles } = body;

    if (!username || !password || !full_name || !email || !roles || !Array.isArray(roles)) {
      return errorResponse('VALIDATION_ERROR', 'Missing required fields', undefined, 400);
    }

    if (password.length < 8) {
      return errorResponse('VALIDATION_ERROR', 'Password must be at least 8 characters', undefined, 400);
    }

    // Only SUPER_ADMIN can create another SUPER_ADMIN
    if (roles.includes('SUPER_ADMIN') && !session.roles.includes('SUPER_ADMIN')) {
      return errorResponse('FORBIDDEN', 'Only SUPER_ADMIN can assign SUPER_ADMIN role', undefined, 403);
    }

    await client.query('BEGIN');

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const userRes = await client.query(`
      INSERT INTO users (id, username, full_name, email, student_code, password_hash, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, username
    `, [username, full_name, email, student_code || null, password_hash]);

    const newUserId = userRes.rows[0].id;

    // Assign roles
    for (const roleName of roles) {
      const roleRes = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
      if (roleRes.rows.length > 0) {
        await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [newUserId, roleRes.rows[0].id]);
      }
    }

    await AuditService.log(session.userId, 'CREATE', 'users', `Created user ${username}`, client);

    await client.query('COMMIT');
    return successResponse({ id: newUserId, username }, 201);
  } catch (error: unknown) {
    const err = error as { code?: string };
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return errorResponse('VALIDATION_ERROR', 'Username, email or student code already exists', undefined, 400);
    }
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  } finally {
    client.release();
  }
}
