import { pool } from '@/lib/pg';

export class DashboardService {
  static async getStudentDashboard(userId: string) {
    const countsRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'BORROWED') as active_count,
        COUNT(*) FILTER (WHERE status = 'OVERDUE') as overdue_count,
        COUNT(*) FILTER (WHERE status IN ('PENDING', 'APPROVED', 'READY_FOR_PICKUP')) as pending_count
      FROM loans WHERE user_id = $1
    `, [userId]);

    const recentLoansRes = await pool.query(`
      SELECT * FROM loans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5
    `, [userId]);

    const upcomingDueRes = await pool.query(`
      SELECT * FROM loans 
      WHERE user_id = $1 AND status = 'BORROWED' AND expected_return_date >= NOW()
      ORDER BY expected_return_date ASC LIMIT 5
    `, [userId]);

    const notifRes = await pool.query(`
      SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = false
    `, [userId]);

    return {
      counts: countsRes.rows[0],
      recent_loans: recentLoansRes.rows,
      upcoming_due: upcomingDueRes.rows,
      unread_notifications: parseInt(notifRes.rows[0].unread_count, 10)
    };
  }

  static async getAdminDashboard(): Promise<{loans: Record<string, number>, kits: Record<string, number>, disputes: Record<string, number>, ai_scans: Record<string, number>, trend: Record<string, unknown>[]}> {
    const loanCounts = await pool.query(`SELECT status, COUNT(*) FROM loans GROUP BY status`);
    const kitCounts = await pool.query(`SELECT status, COUNT(*) FROM kits GROUP BY status`);
    const disputeCounts = await pool.query(`SELECT status, COUNT(*) FROM disputes GROUP BY status`);
    const aiCounts = await pool.query(`SELECT category, COUNT(*) FROM ai_scans GROUP BY category`);

    const trend = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) 
      FROM loans 
      WHERE created_at >= NOW() - INTERVAL '30 days' 
      GROUP BY DATE(created_at) ORDER BY date
    `);

    // Basic map transformation
    const arrayToMap = (rows: Record<string, unknown>[], keyCol: string, valCol: string): Record<string, number> => { const map: Record<string, number> = {}; rows.forEach(row => { map[String(row[keyCol])] = parseInt(String(row[valCol]), 10); }); return map; };

    return {
      loans: arrayToMap(loanCounts.rows, 'status', 'count'),
      kits: arrayToMap(kitCounts.rows, 'status', 'count'),
      disputes: arrayToMap(disputeCounts.rows, 'status', 'count'),
      ai_scans: arrayToMap(aiCounts.rows, 'category', 'count'),
      trend: trend.rows,
    };
  }
}
