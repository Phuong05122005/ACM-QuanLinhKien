import { describe, it, expect, vi } from 'vitest';
import { processPickup } from '@/lib/qr/service';
import { GET as AuditGET } from '@/app/api/admin/audit/route';
import { POST as ReviewPOST } from '@/app/api/admin/reviews/route';
import { GET as DisputesGET } from '@/app/api/disputes/route';
import { pool } from '@/lib/pg';

vi.mock('@/lib/pg', () => ({
  pool: {
    connect: vi.fn(),
    query: vi.fn(),
  },
}));

let mockRoles = ['STUDENT'];
let mockUserId = 'student-1';
vi.mock('jose', () => {
  return {
    jwtVerify: vi.fn().mockImplementation(async () => {
      return {
        protectedHeader: { alg: 'HS256' }, 
        payload: { userId: mockUserId, username: 'testuser', roles: mockRoles }
      };
    }),
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'fake-token' })),
  }))
}));

describe('Security Edge Cases', () => {
  it('should reject QR pickup with forged student ownership', async () => {
    const clientMock = {
      query: vi.fn().mockImplementation(async (queryStr: string) => {
        if (queryStr === 'BEGIN' || queryStr === 'ROLLBACK') return {};
        if (queryStr.includes('qr_codes')) {
          return { rows: [{ id: 'qr1', entity_type: 'LOAN', entity_id: 'L1', code: 'QR-123' }] };
        }
        if (queryStr.includes('loans')) {
          return { rows: [{ id: 'L1', user_id: 'student-2', status: 'READY_FOR_PICKUP' }] };
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    };
    vi.mocked(pool.connect).mockResolvedValue(clientMock as never);

    await expect(processPickup('L1', 'QR-123', 'student-1'))
      .rejects.toThrow('Unauthorized: wrong student');
  });

  it('should reject unauthenticated access to admin endpoints', async () => {
    mockRoles = ['STUDENT']; // Logged in as student
    const req = new Request('http://localhost/api/admin/audit');
    const res = await AuditGET(req);
    expect(res.status).toBe(403);
  });

  it('should reject unauthorized role on human review', async () => {
    mockRoles = ['STUDENT'];
    const req = new Request('http://localhost/api/admin/reviews', {
      method: 'POST',
      body: JSON.stringify({ scan_id: 'scan-1', decision: 'ACCEPTED' })
    });
    const res = await ReviewPOST(req);
    expect(res.status).toBe(403);
  });

  it('should enforce object-level authorization on disputes', async () => {
    mockRoles = ['STUDENT'];
    mockUserId = 'student-1'; // the session

    // the api endpoint GET /api/disputes currently enforces `user_id = session.userId` 
    // natively in the sql query or via filtering.
    // Wait, let's test if the DB client gets the session userId.
    vi.mocked(pool.query).mockImplementation(async (q: string, params: unknown[]) => {
      // Return something, we just want to ensure params[0] is session.userId
      expect(params[0]).toBe('student-1');
      return { rows: [] };
    });

    const req = new Request('http://localhost/api/disputes');
    const res = await DisputesGET(req);
    expect(res.status).toBe(200);
  });
});
