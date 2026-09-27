import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processPickup, generateQrCode } from '@/lib/qr/service';
import { pool } from '@/lib/pg';

vi.mock('@/lib/pg', () => ({
  pool: {
    connect: vi.fn(),
  },
}));

describe('QR Service Pickup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject wrong student', async () => {
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string) => {
        if (queryStr === 'BEGIN' || queryStr === 'ROLLBACK') return {};
        if (queryStr.includes('SELECT * FROM loans')) {
          return { rows: [{ id: 'L1', status: 'READY_FOR_PICKUP', user_id: 'other-student' }] };
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    } as never);

    await expect(processPickup('L1', 'QR-123', 'student-1')).rejects.toThrow('Unauthorized: wrong student');
  });

  it('should be idempotent for BORROWED state', async () => {
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string) => {
        if (queryStr === 'BEGIN' || queryStr === 'COMMIT') return {};
        if (queryStr.includes('SELECT * FROM loans')) {
          return { rows: [{ id: 'L1', status: 'BORROWED', user_id: 'student-1' }] };
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    } as never);

    const res = await processPickup('L1', 'QR-123', 'student-1');
    expect(res.status).toBe('BORROWED');
  });

  it('should reject wrong state', async () => {
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string) => {
        if (queryStr === 'BEGIN' || queryStr === 'ROLLBACK') return {};
        if (queryStr.includes('SELECT * FROM loans')) {
          return { rows: [{ id: 'L1', status: 'PENDING', user_id: 'student-1' }] };
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    } as never);

    await expect(processPickup('L1', 'QR-123', 'student-1')).rejects.toThrow('Invalid loan state for pickup: PENDING');
  });

  it('should reject missing QR', async () => {
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string) => {
        if (queryStr === 'BEGIN' || queryStr === 'ROLLBACK') return {};
        if (queryStr.includes('SELECT * FROM loans')) {
          return { rows: [{ id: 'L1', status: 'READY_FOR_PICKUP', user_id: 'student-1' }] };
        }
        if (queryStr.includes('SELECT * FROM qr_codes')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    } as never);

    await expect(processPickup('L1', 'QR-123', 'student-1')).rejects.toThrow('QR code does not exist');
  });

  it('should process successful pickup atomically', async () => {
    const queryMock = vi.fn().mockImplementation(async (queryStr: string) => {
      if (queryStr === 'BEGIN' || queryStr === 'COMMIT' || queryStr === 'ROLLBACK' || queryStr.includes('DELETE FROM qr_codes')) return {};
      if (queryStr.includes('SELECT * FROM loans')) {
        return { rows: [{ id: 'L1', loan_code: 'L1', status: 'READY_FOR_PICKUP', user_id: 'student-1' }] };
      }
      if (queryStr.includes('SELECT * FROM qr_codes')) {
        return { rows: [{ id: 'Q1', entity_type: 'KIT', entity_id: 'K1' }] };
      }
      if (queryStr.includes('SELECT * FROM loan_items')) {
        return { rows: [{ loan_id: 'L1', kit_id: 'K1', quantity: 1 }] };
      }
      if (queryStr.includes('UPDATE loans')) {
        return { rows: [{ id: 'L1', status: 'BORROWED' }] };
      }
      if (queryStr.includes('INSERT')) {
        return { rows: [] };
      }
      return { rows: [] };
    });

    vi.mocked(pool.connect).mockResolvedValue({
      query: queryMock,
      release: vi.fn(),
    } as never);

    const res = await processPickup('L1', 'QR-123', 'student-1');
    expect(res.status).toBe('BORROWED');
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO loan_status_histories"),
      expect.any(Array)
    );
  });
});
