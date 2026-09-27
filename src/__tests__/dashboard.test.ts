import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from '@/lib/dashboard/service';
import { pool } from '@/lib/pg';

vi.mock('@/lib/pg', () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe('Dashboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should aggregate student dashboard data', async () => {
    vi.mocked(pool.query).mockImplementation(async (queryStr: string) => {
      if (queryStr.includes('active_count')) {
        return { rows: [{ active_count: '2', overdue_count: '1', pending_count: '0' }] };
      }
      if (queryStr.includes('unread_count')) {
        return { rows: [{ unread_count: '5' }] };
      }
      return { rows: [] };
    });

    const data = await DashboardService.getStudentDashboard('student-1');
    expect(data.counts.active_count).toBe('2');
    expect(data.unread_notifications).toBe(5);
  });

  it('should aggregate admin dashboard data avoiding N+1', async () => {
    vi.mocked(pool.query).mockImplementation(async (queryStr: string) => {
      if (queryStr.includes('SUM(total_quantity)')) {
        return { rows: [{ total_components: '100', available_components: '80' }] };
      }
      if (queryStr.includes('FROM loans')) {
        return { rows: [{ status: 'PENDING', count: '3' }, { status: 'RETURN_REQUIRES_INSPECTION', count: '2' }] };
      }
      if (queryStr.includes('FROM disputes')) {
        return { rows: [{ status: 'PENDING', count: '1' }] };
      }
      if (queryStr.includes('FROM ai_scans')) {
        return { rows: [{ status: 'COMPLETED', count: '20' }] };
      }
      return { rows: [] };
    });

    const data = await DashboardService.getAdminDashboard();
    expect(data.components.total).toBe(100);
    expect(data.components.available).toBe(80);
    expect(data.loans['RETURN_REQUIRES_INSPECTION']).toBe(2);
    expect(data.ai_scans['COMPLETED']).toBe(20);
  });
});
