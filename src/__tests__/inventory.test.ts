import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processInventoryTransaction } from '@/lib/inventory/service';
import { pool } from '@/lib/pg';

// We need to mock the pool.connect() to simulate a concurrency test using an in-memory variable
vi.mock('@/lib/pg', () => ({
  pool: {
    connect: vi.fn(),
  },
}));

describe('Inventory Concurrency Test', () => {
  let inventory = 1;

  beforeEach(() => {
    vi.clearAllMocks();
    inventory = 1;

    // Simulate atomic update behavior
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string, values?: unknown[]) => {
        if (queryStr === 'BEGIN' || queryStr === 'COMMIT' || queryStr === 'ROLLBACK') {
          return {};
        }

        if (queryStr.includes('UPDATE components')) {
          // Simulate latency
          await new Promise(r => setTimeout(r, 10));

          const change = Number(values![0]);
          if (change < 0 && inventory >= Math.abs(change)) {
            inventory += change;
            return { rowCount: 1, rows: [{ available_quantity: inventory, total_quantity: inventory }] };
          } else if (change > 0) {
            inventory += change;
            return { rowCount: 1, rows: [{ available_quantity: inventory, total_quantity: inventory }] };
          }
          return { rowCount: 0, rows: [] };
        }

        if (queryStr.includes('INSERT')) {
          return { rowCount: 1 };
        }
        
        return { rowCount: 1, rows: [] };
      }),
      release: vi.fn(),
    } as never);
  });

  it('exactly one succeeds and inventory never becomes -1', async () => {
    // Two concurrent requests to borrow 1 item when inventory is 1
    const promises = [
      processInventoryTransaction({
        componentId: 'comp-1',
        quantityChange: -1,
        transactionType: 'BORROW',
        userId: 'user-1'
      }),
      processInventoryTransaction({
        componentId: 'comp-1',
        quantityChange: -1,
        transactionType: 'BORROW',
        userId: 'user-2'
      }),
    ];

    const results = await Promise.allSettled(promises);

    const succeeded = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    expect(succeeded.length).toBe(1);
    expect(failed.length).toBe(1);
    if (failed[0].status === 'rejected') {
      expect(failed[0].reason.message).toBe('INSUFFICIENT_INVENTORY');
    }
    
    // Inventory should be exactly 0, never -1
    expect(inventory).toBe(0);
  });
});
