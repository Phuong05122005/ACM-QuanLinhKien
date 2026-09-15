import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoanStateMachine, LoanState } from '@/lib/loan/loan.state-machine';
import { LoanPolicy } from '@/lib/loan/loan.policy';
import { transitionLoanState } from '@/lib/loan/service';
import { pool } from '@/lib/pg';

vi.mock('@/lib/pg', () => ({
  pool: {
    connect: vi.fn(),
  },
}));

describe('Loan State Machine', () => {
  it('should allow valid transitions for ADMIN', () => {
    expect(LoanStateMachine.canTransition('PENDING', 'APPROVED', 'ADMIN')).toBe(true);
    expect(LoanStateMachine.canTransition('APPROVED', 'READY_FOR_PICKUP', 'ADMIN')).toBe(true);
    expect(LoanStateMachine.canTransition('READY_FOR_PICKUP', 'BORROWED', 'ADMIN')).toBe(true);
    expect(LoanStateMachine.canTransition('BORROWED', 'RETURNED', 'ADMIN')).toBe(true);
    expect(LoanStateMachine.canTransition('BORROWED', 'OVERDUE', 'ADMIN')).toBe(true);
  });

  it('should reject invalid transitions', () => {
    expect(LoanStateMachine.canTransition('PENDING', 'BORROWED', 'ADMIN')).toBe(false);
    expect(LoanStateMachine.canTransition('RETURNED', 'BORROWED', 'ADMIN')).toBe(false);
  });

  it('should allow idempotent transitions', () => {
    expect(LoanStateMachine.canTransition('APPROVED', 'APPROVED', 'ADMIN')).toBe(true);
  });

  it('should reject transitions for STUDENT', () => {
    expect(LoanStateMachine.canTransition('PENDING', 'APPROVED', 'STUDENT')).toBe(false);
  });
});

describe('Loan Policy', () => {
  it('should validate duration correctly', () => {
    const today = new Date();
    const threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 3);
    
    expect(() => LoanPolicy.validateDuration(today, threeDays)).not.toThrow();
    
    const tooLong = new Date(today);
    tooLong.setDate(tooLong.getDate() + 10);
    expect(() => LoanPolicy.validateDuration(today, tooLong)).toThrow();
    
    const past = new Date(today);
    past.setDate(past.getDate() - 1);
    expect(() => LoanPolicy.validateDuration(today, past)).toThrow();
  });

  it('should validate component limit', () => {
    expect(() => LoanPolicy.validateComponentLimit(3)).not.toThrow();
    expect(() => LoanPolicy.validateComponentLimit(6)).toThrow();
    expect(() => LoanPolicy.validateComponentLimit(0)).toThrow();
  });
});

describe('Loan Service Concurrency (transition)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject transition if inventory is insufficient', async () => {
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string, values: unknown[]) => {
        if (queryStr === 'BEGIN' || queryStr === 'ROLLBACK') return {};
        if (queryStr.includes('SELECT * FROM loans')) {
          return { rows: [{ id: 'L1', status: 'PENDING' }] };
        }
        if (queryStr.includes('SELECT * FROM loan_items')) {
          return { rows: [{ component_id: 'C1', quantity: 10 }] };
        }
        if (queryStr.includes('UPDATE components')) {
          // Simulate inventory failure!
          return { rowCount: 0 };
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    } as never);

    await expect(transitionLoanState('L1', 'APPROVED', 'admin-1', 'ADMIN'))
      .rejects.toThrow('Insufficient inventory');
  });

  it('should deduct inventory exactly once if already APPROVED', async () => {
    let updateCalls = 0;
    
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string, values: unknown[]) => {
        if (queryStr === 'BEGIN' || queryStr === 'COMMIT') return {};
        if (queryStr.includes('SELECT * FROM loans')) {
          // State is already APPROVED
          return { rows: [{ id: 'L1', status: 'APPROVED' }] };
        }
        if (queryStr.includes('UPDATE components')) {
          updateCalls++;
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    } as never);

    const res = await transitionLoanState('L1', 'APPROVED', 'admin-1', 'ADMIN');
    expect(res.status).toBe('APPROVED');
    expect(updateCalls).toBe(0); // Should not update components! Idempotent
  });
});
