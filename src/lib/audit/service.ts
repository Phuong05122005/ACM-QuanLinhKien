import { pool } from '@/lib/pg';

export class AuditService {
  /**
   * Append-only audit log.
   * Strips out known secrets just in case.
   */
  static async log(userId: string, action: string, resource: string, details: unknown, clientToUse: { query: (text: string, params?: unknown[]) => Promise<unknown> } = pool) {
    let sanitizedDetails = typeof details === 'string' ? details : JSON.stringify(details);
    
    // Naive secret stripping for safety
    sanitizedDetails = sanitizedDetails.replace(/password"\s*:\s*"[^"]+"/g, 'password":"***"');
    sanitizedDetails = sanitizedDetails.replace(/token"\s*:\s*"[^"]+"/g, 'token":"***"');

    await clientToUse.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
    `, [userId, action, resource, sanitizedDetails]);
  }

  // intentionally omitted: delete() / update() to ensure immutability at the service level.
}
