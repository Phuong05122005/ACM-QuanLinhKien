import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as KitsGET, POST as KitsPOST } from '@/app/api/kits/route';
import { GET as KitGET, PUT as KitPUT } from '@/app/api/kits/[id]/route';
import { POST as KitCompPOST } from '@/app/api/kits/[id]/components/route';
import { pool } from '@/lib/pg';

vi.mock('@/lib/pg', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({
    userId: 'admin-1',
    roles: ['ADMIN'],
  }),
}));

describe('Kits API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/kits', () => {
    it('should return calculated availability', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ id: 'k1', name: 'Kit A', available_kits_count: 5 }]
      } as never);

      const req = new Request('http://localhost/api/kits');
      const res = await KitsGET(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data[0].available_kits_count).toBe(5);
    });
  });

  describe('POST /api/kits', () => {
    it('should reject if required fields are missing', async () => {
      const req = new Request('http://localhost/api/kits', {
        method: 'POST',
        body: JSON.stringify({ name: 'Kit A' }), // missing code
      });
      const res = await KitsPOST(req);
      expect(res.status).toBe(400);
    });

    it('should create a kit', async () => {
      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [{ id: 'k1', code: 'K-001' }] } as never)
        .mockResolvedValueOnce({} as never);

      const req = new Request('http://localhost/api/kits', {
        method: 'POST',
        body: JSON.stringify({ name: 'Kit A', code: 'K-001', status: 'AVAILABLE' }),
      });
      const res = await KitsPOST(req);
      expect(res.status).toBe(201);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO kits'),
        expect.arrayContaining(['Kit A', '', 'K-001', 'AVAILABLE'])
      );
    });
  });

  describe('POST /api/kits/[id]/components', () => {
    it('should reject negative expected quantity', async () => {
      const req = new Request('http://localhost/api/kits/1/components', {
        method: 'POST',
        body: JSON.stringify({ component_id: 'c1', expected_quantity: -1 }),
      });
      const res = await KitCompPOST(req, { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(400);
    });

    it('should upsert component into kit', async () => {
      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [{ kit_id: 'k1', component_id: 'c1', expected_quantity: 2 }] } as never)
        .mockResolvedValueOnce({} as never);

      const req = new Request('http://localhost/api/kits/1/components', {
        method: 'POST',
        body: JSON.stringify({ component_id: 'c1', expected_quantity: 2 }),
      });
      const res = await KitCompPOST(req, { params: Promise.resolve({ id: 'k1' }) });
      expect(res.status).toBe(200);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT (kit_id, component_id)'),
        expect.arrayContaining(['k1', 'c1', 2])
      );
    });
  });
});
