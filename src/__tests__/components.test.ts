import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as ComponentsPOST } from '@/app/api/components/route';
import { PUT as ComponentIdPUT } from '@/app/api/components/[id]/route';
import { pool } from '@/lib/pg';

vi.mock('@/lib/pg', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'fake-token' })),
  }))
}));

vi.mock('jose', () => {
  return {
    jwtVerify: vi.fn().mockResolvedValue({
      protectedHeader: { alg: 'HS256' }, payload: { userId: '123', username: 'admin1', roles: ['ADMIN'] }
    }),
  };
});

describe('Components API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/components', () => {
    it('should create a component successfully', async () => {
      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [{ id: 'comp-1', name: 'Arduino' }] } as never)
        .mockResolvedValueOnce({} as never); // audit log
      
      const req = new Request('http://localhost/api/components', {
        method: 'POST',
        body: JSON.stringify({ 
          name: 'Arduino Uno',
          category_id: 'e6b90835-2311-4f1b-be4c-0d3abcc2c286',
          total_quantity: 10,
          identifier: 'ARD-01'
        }),
      });
      const res = await ComponentsPOST(req);
      expect(res.status).toBe(201);
      
      const data = await res.json();
      expect(data.data.name).toBe('Arduino');
    });

    it('should block negative quantity', async () => {
      const req = new Request('http://localhost/api/components', {
        method: 'POST',
        body: JSON.stringify({ 
          name: 'Arduino Uno',
          category_id: 'e6b90835-2311-4f1b-be4c-0d3abcc2c286',
          total_quantity: -5,
          identifier: 'ARD-02'
        }),
      });
      const res = await ComponentsPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/components/[id]', () => {
    it('should update component', async () => {
      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [{ id: 'comp-1', name: 'Arduino Updated' }] } as never)
        .mockResolvedValueOnce({} as never);
        
      const req = new Request('http://localhost/api/components/comp-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Arduino Updated' })
      });
      const res = await ComponentIdPUT(req, { params: Promise.resolve({ id: 'comp-1' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.name).toBe('Arduino Updated');
    });
  });
});
