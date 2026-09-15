import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from '@/lib/storage/service';
import { AIInspectionService } from '@/lib/ai/service';
import { POST as ReturnConfirmPOST } from '@/app/api/loans/[id]/return/confirm/route';
import { POST as AdminReviewPOST } from '@/app/api/admin/reviews/route';
import { pool } from '@/lib/pg';

vi.mock('@/lib/pg', () => ({
  pool: {
    connect: vi.fn(),
    query: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({
    userId: 'admin-1',
    roles: ['ADMIN'],
  }),
}));

describe('Return Upload & AI', () => {
  it('should validate allowed mime types and size', async () => {
    // Generate a massive file
    const largeContent = new ArrayBuffer(11 * 1024 * 1024);
    const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    await expect(StorageService.saveEvidence(largeFile, 'user-1')).rejects.toThrow('File exceeds 10MB limit');

    // Generate wrong mime
    const badMimeFile = new File(['bad'], 'test.exe', { type: 'application/x-msdownload' });
    await expect(StorageService.saveEvidence(badMimeFile, 'user-1')).rejects.toThrow('Invalid MIME type');

    // Generate wrong ext
    const badExtFile = new File(['bad'], 'test.txt', { type: 'image/jpeg' });
    await expect(StorageService.saveEvidence(badExtFile, 'user-1')).rejects.toThrow('Invalid extension');
  });

  it('AI Inspection should identify missing items', async () => {
    const res = await AIInspectionService.inspect('missing-image.jpg');
    expect(res.category).toBe('MISSING');
    expect(res.confidence).toBe(0.95);
    expect(AIInspectionService.getReviewAction(res.confidence, res.category)).toBe('NEEDS_REVIEW');
  });

  it('AI Inspection should identify damaged items', async () => {
    const res = await AIInspectionService.inspect('damaged-image.jpg');
    expect(res.category).toBe('DAMAGED');
    expect(AIInspectionService.getReviewAction(res.confidence, res.category)).toBe('NEEDS_REVIEW');
  });

  it('AI Inspection should fallback safely on failure', async () => {
    const res = await AIInspectionService.inspect('fail-image.jpg');
    expect(res.category).toBe('UNKNOWN');
    expect(res.confidence).toBe(0);
    expect(AIInspectionService.getReviewAction(res.confidence, res.category)).toBe('NEEDS_REVIEW');
  });
});

describe('Return Confirmation APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should require reason for CORRECT review decision', async () => {
    const req = new Request('http://localhost/api/admin/reviews', {
      method: 'POST',
      body: JSON.stringify({ scan_id: 's1', decision: 'CORRECT', reason: '' }),
    });
    const res = await AdminReviewPOST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.message).toBe('Reason is required for correction');
  });

  it('should process CONFIRM decision and transition to RETURNED', async () => {
    vi.mocked(pool.connect).mockResolvedValue({
      query: vi.fn().mockImplementation(async (queryStr: string) => {
        if (queryStr === 'BEGIN' || queryStr === 'COMMIT') return {};
        if (queryStr.includes('SELECT loan_id FROM ai_scans')) return { rows: [{ loan_id: 'L1' }] };
        if (queryStr.includes('SELECT * FROM loans')) return { rows: [{ id: 'L1', status: 'RETURN_REQUIRES_INSPECTION' }] };
        if (queryStr.includes('UPDATE loans')) return { rows: [{ id: 'L1', status: 'RETURNED' }] };
        return { rows: [] };
      }),
      release: vi.fn(),
    } as never);

    const req = new Request('http://localhost/api/admin/reviews', {
      method: 'POST',
      body: JSON.stringify({ scan_id: 's1', decision: 'CONFIRM' }),
    });
    const res = await AdminReviewPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.loan.status).toBe('RETURNED');
  });
});
