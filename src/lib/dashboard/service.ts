import { pool } from '@/lib/pg';

export class DashboardService {
  static async getStudentDashboard(userId: string) {
    const countsRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'BORROWED') as active_count,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
        COUNT(*) FILTER (WHERE status = 'BORROWED' AND due_date < NOW()) as overdue_count
      FROM loans 
      WHERE user_id = $1
    `, [userId]);

    const upcomingDueRes = await pool.query(`
      SELECT id, loan_code, status, due_date 
      FROM loans 
      WHERE user_id = $1 AND status = 'BORROWED'
      ORDER BY due_date ASC
      LIMIT 5
    `, [userId]);

    const unreadNotificationsRes = await pool.query(`
      SELECT COUNT(*) as unread_count 
      FROM notifications 
      WHERE user_id = $1 AND is_read = false
    `, [userId]);

    return {
      counts: countsRes.rows[0],
      upcoming_due: upcomingDueRes.rows,
      unread_notifications: parseInt(unreadNotificationsRes.rows[0].unread_count, 10)
    };
  }

  static async getAdminDashboard() {
    // Inventory overview
    const inventoryRes = await pool.query(`
      SELECT 
        SUM(total_quantity) as total_components,
        SUM(available_quantity) as available_components
      FROM components
    `);

    // Loans by status
    const loansRes = await pool.query(`
      SELECT status, COUNT(*) 
      FROM loans 
      GROUP BY status
    `);

    // Disputes by status
    const disputesRes = await pool.query(`
      SELECT status, COUNT(*) 
      FROM disputes 
      GROUP BY status
    `);

    // AI scans by status
    const aiScansRes = await pool.query(`
      SELECT status, COUNT(*) 
      FROM ai_scans 
      GROUP BY status
    `);

    const formatCounts = (rows: { status: string; count: string }[]) => rows.reduce((acc, row) => ({ ...acc, [row.status]: parseInt(row.count, 10) }), {} as Record<string, number>);

    return {
      components: {
        total: parseInt(inventoryRes.rows[0].total_components || '0', 10),
        available: parseInt(inventoryRes.rows[0].available_components || '0', 10)
      },
      loans: formatCounts(loansRes.rows),
      disputes: formatCounts(disputesRes.rows),
      ai_scans: formatCounts(aiScansRes.rows)
    };
  }
}
