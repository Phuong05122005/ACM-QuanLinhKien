import { pool } from '@/lib/pg';
import { createSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return errorResponse('VALIDATION_ERROR', 'Missing username or password', undefined, 400);
    }

    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return errorResponse('AUTH_ERROR', 'Invalid credentials', undefined, 401);
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return errorResponse('AUTH_ERROR', 'Account is disabled', undefined, 403);
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return errorResponse('AUTH_ERROR', 'Account locked', undefined, 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      const attempts = user.failed_attempts + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      
      await pool.query(
        'UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3',
        [attempts, lockedUntil, user.id]
      );

      return errorResponse('AUTH_ERROR', 'Invalid credentials', undefined, 401);
    }

    // Success! Reset failed attempts
    await pool.query(
      'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1',
      [user.id]
    );

    // Get roles
    const roleResult = await pool.query(`
      SELECT r.name 
      FROM roles r 
      JOIN user_roles ur ON r.id = ur.role_id 
      WHERE ur.user_id = $1
    `, [user.id]);
    const roles = roleResult.rows.map((r: { name: string }) => r.name);

    // Create session
    await createSession({
      userId: user.id,
      username: user.username,
      studentId: user.student_code,
      roles,
    });

    // Audit log
    await pool.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, 'LOGIN', 'auth', 'User logged in successfully')
    `, [user.id]);

    return successResponse({ message: 'Logged in successfully' });
  } catch(error: unknown) {
    console.error(error);
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
