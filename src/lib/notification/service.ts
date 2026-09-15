import { pool } from '@/lib/pg';

export class NotificationService {
  static async notify(userId: string, title: string, message: string, clientToUse: { query: (text: string, params?: unknown[]) => Promise<unknown> } = pool) {
    await clientToUse.query(`
      INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, false, NOW())
    `, [userId, title, message]);
  }

  static async markAsRead(userId: string, notificationId?: string) {
    if (notificationId) {
      await pool.query(`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [notificationId, userId]);
    } else {
      await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const res = await pool.query(`SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`, [userId]);
    return parseInt(res.rows[0].count, 10);
  }
}
