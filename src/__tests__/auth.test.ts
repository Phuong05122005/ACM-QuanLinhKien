import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jwtVerify } from 'jose';
import { POST as LoginPOST } from '@/app/api/auth/login/route';
import { POST as LogoutPOST } from '@/app/api/auth/logout/route';
import { GET as SessionGET } from '@/app/api/auth/session/route';
import { pool } from '@/lib/pg';
import bcrypt from 'bcryptjs';

vi.mock('@/lib/pg', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  }
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(() => ({ value: 'fake-token' })),
  }))
}));

vi.mock('jose', () => {
  return {
    SignJWT: class {
      setProtectedHeader = vi.fn().mockReturnThis();
      setIssuedAt = vi.fn().mockReturnThis();
      setExpirationTime = vi.fn().mockReturnThis();
      sign = vi.fn().mockResolvedValue('fake-token');
    },
    jwtVerify: vi.fn().mockResolvedValue({
      protectedHeader: { alg: 'HS256' }, payload: { userId: '123', username: 'student1', roles: ['STUDENT'] }
    }),
  };
});

describe('Authentication API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should reject missing credentials', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const res = await LoginPOST(req);
      expect(res.status).toBe(400);
    });

    it('should reject invalid username', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as never);
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'bad', password: 'pwd' }),
      });
      const res = await LoginPOST(req);
      expect(res.status).toBe(401);
    });

    it('should block disabled account', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ id: '1', is_active: false }]
      } as never);
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'user', password: 'pwd' }),
      });
      const res = await LoginPOST(req);
      expect(res.status).toBe(403);
    });

    it('should block locked account', async () => {
      const future = new Date(Date.now() + 10000).toISOString();
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ id: '1', is_active: true, locked_until: future }]
      } as never);
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'user', password: 'pwd' }),
      });
      const res = await LoginPOST(req);
      expect(res.status).toBe(403);
    });

    it('should lock account after 5 failed attempts', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ id: '1', is_active: true, failed_attempts: 4, password_hash: 'hash' }]
      } as never);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);
      
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'user', password: 'bad' }),
      });
      const res = await LoginPOST(req);
      expect(res.status).toBe(401);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET failed_attempts = $1, locked_until = $2'),
        expect.arrayContaining([5, expect.any(Date), '1'])
      );
    });

    it('should login successfully', async () => {
      vi.mocked(pool.query)
        .mockResolvedValueOnce({
          rows: [{ id: '1', username: 'user', is_active: true, failed_attempts: 0, password_hash: 'hash' }]
        } as never)
        .mockResolvedValueOnce({} as never)
        .mockResolvedValueOnce({ rows: [{ name: 'STUDENT' }] } as never)
        .mockResolvedValueOnce({} as never);
        
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'user', password: 'pwd' }),
      });
      const res = await LoginPOST(req);
      expect(res.status).toBe(200);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_logs'),
        expect.arrayContaining(['1'])
      );
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and log audit', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({} as never);
      const req = new Request('http://localhost/api/auth/logout', { method: 'POST' });
      const res = await LogoutPOST();
      expect(res.status).toBe(200);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('LOGOUT'),
        expect.any(Array)
      );
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return session', async () => {
      const res = await SessionGET();
      expect(res.status).toBe(200);
    });
  });
});

describe('RBAC & Ownership Security', () => {
  it('should block student accessing admin API', async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      protectedHeader: { alg: 'HS256' }, payload: { userId: '123', username: 'student1', roles: ['STUDENT'] }
    });
    const { requireRole } = await import('@/lib/auth');
    await expect(requireRole(['ADMIN', 'SUPER_ADMIN'])).rejects.toThrow('FORBIDDEN');
  });

  it('should block student accessing another student resource', async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      protectedHeader: { alg: 'HS256' }, payload: { userId: '123', username: 'student1', roles: ['STUDENT'] }
    });
    const { requireOwnership } = await import('@/lib/auth');
    await expect(requireOwnership('456')).rejects.toThrow('FORBIDDEN');
  });

  it('should allow student accessing own resource', async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      protectedHeader: { alg: 'HS256' }, payload: { userId: '123', username: 'student1', roles: ['STUDENT'] }
    });
    const { requireOwnership } = await import('@/lib/auth');
    const session = await requireOwnership('123');
    expect(session.userId).toBe('123');
  });

  it('should allow admin accessing student resource', async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      protectedHeader: { alg: 'HS256' }, payload: { userId: '789', username: 'admin1', roles: ['ADMIN'] }
    });
    const { requireOwnership } = await import('@/lib/auth');
    const session = await requireOwnership('123');
    expect(session.userId).toBe('789');
  });

  it('should reject forged tokens', async () => {
    vi.mocked(jwtVerify).mockRejectedValueOnce(new Error('Invalid token'));
    const { getSession } = await import('@/lib/auth');
    const session = await getSession();
    expect(session).toBeNull();
  });
});
