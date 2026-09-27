import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as CategoriesPOST } from '@/app/api/categories/route';
import { PUT as CategoryIdPUT } from '@/app/api/categories/[id]/route';
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

describe('Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/categories', () => {
    it('should create a category', async () => {
      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [{ id: 'cat-1', name: 'Microcontrollers' }] } as never)
        ;
      
      const req = new Request('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Microcontrollers' })
      });
      const res = await CategoriesPOST(req);
      expect(res.status).toBe(201);
    });

    it('should handle duplicate name', async () => {
      vi.mocked(pool.query).mockRejectedValueOnce({ code: '23505' });
      const req = new Request('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Dup' })
      });
      const res = await CategoriesPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.message).toBe('Category name already exists');
    });
  });

  describe('PUT /api/categories/[id]', () => {
    it('should update category', async () => {
      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [{ id: 'cat-1', name: 'Updated' }] } as never)
        ;
        
      const req = new Request('http://localhost/api/categories/cat-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' })
      });
      const res = await CategoryIdPUT(req, { params: Promise.resolve({ id: 'cat-1' }) });
      expect(res.status).toBe(200);
    });
  });
});
