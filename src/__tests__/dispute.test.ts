import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeService, DISPUTE_DEADLINE_HOURS } from '@/lib/dispute/service';
import { pool } from '@/lib/pg';

vi.mock('@/lib/pg', () => ({
  pool: {
    connect: vi.fn(),
    query: vi.fn(),
  },
}));

describe('Dispute Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject dispute creation if past deadline', async () => {
    const oldDate = new Date();
    oldDate.setHours(oldDate.getHours() - (DISPUTE_DEADLINE_HOURS + 1));

    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string) => {
        if (queryStr === 'BEGIN' || queryStr === 'ROLLBACK') return {};
        if (queryStr.includes('SELECT * FROM loans')) {
          return { rows: [{ id: 'L1', user_id: 'student-1', status: 'RETURN_REQUIRES_INSPECTION' }] };
        }
        if (queryStr.includes('loan_status_histories')) {
          return { rows: [{ created_at: oldDate }] };
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    } as never);

    await expect(DisputeService.createDispute('L1', 'student-1', 'Missing part')).rejects.toThrow(/deadline passed/);
  });

  it('should reject dispute creation if wrong student', async () => {
    const recentDate = new Date();
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string) => {
        if (queryStr === 'BEGIN' || queryStr === 'ROLLBACK') return {};
        if (queryStr.includes('SELECT * FROM loans')) {
          return { rows: [{ id: 'L1', user_id: 'other-student', status: 'RETURNED' }] };
        }
        if (queryStr.includes('loan_status_histories')) {
          return { rows: [{ created_at: recentDate }] };
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    } as never);

    await expect(DisputeService.createDispute('L1', 'student-1', 'Reason')).rejects.toThrow('Forbidden: Not your loan');
  });

  it('should require a reason for final decisions', async () => {
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn(),
      release: vi.fn(),
    } as never);

    await expect(DisputeService.reviewDispute('D1', 'admin-1', 'REJECTED', '')).rejects.toThrow('Final decisions require a reason/resolution.');
    await expect(DisputeService.reviewDispute('D1', 'admin-1', 'RESOLVED', '')).rejects.toThrow('Final decisions require a reason/resolution.');
  });
});
