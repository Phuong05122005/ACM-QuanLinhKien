import { describe, it, expect, vi } from 'vitest';
import { GET as ExportGET } from '@/app/api/reports/export/route';
import { pool } from '@/lib/pg';

vi.mock('@/lib/pg', () => ({
  pool: {
    query: vi.fn(),
  },
}));

const mockRoles = ['ADMIN'];
vi.mock('jose', () => {
  return {
    jwtVerify: vi.fn().mockImplementation(async () => {
      return {
        protectedHeader: { alg: 'HS256' }, payload: { userId: 'admin-1', username: 'admin1', roles: mockRoles }
      };
    }),
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'fake-token' })),
  }))
}));

describe('Export CSV API', () => {
  it('should escape CSV formula injections', async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [
        {
          id: 'loan-1',
          loan_code: '=1+1', // malicious
          user_id: '@user', // malicious
          status: '-PENDING', // malicious
          description: '+Hack', // malicious
          normal: 'Safe String',
          created_at: new Date('2026-09-15T00:00:00Z')
        }
      ]
    } as never);

    const req = new Request('http://localhost/api/reports/export?type=loans&format=csv');
    const res = await ExportGET(req);
    
    expect(res.status).toBe(200);
    const text = await res.text();
    
    // Check if the malicious formulas were prefixed with a single quote
    expect(text).toContain(`"'=1+1"`);
    expect(text).toContain(`"'@user"`);
    expect(text).toContain(`"'-PENDING"`);
    expect(text).toContain(`"'+Hack"`);
    expect(text).toContain(`"Safe String"`);
  });

  it('should reject unsupported formats', async () => {
    const reqPdf = new Request('http://localhost/api/reports/export?type=loans&format=pdf');
    const resPdf = await ExportGET(reqPdf);
    expect(resPdf.status).toBe(400);

    const reqXlsx = new Request('http://localhost/api/reports/export?type=loans&format=xlsx');
    const resXlsx = await ExportGET(reqXlsx);
    expect(resXlsx.status).toBe(400);
  });
});
