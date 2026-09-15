import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from '@/lib/audit/service';

describe('Audit Service', () => {
  it('should strip passwords and tokens from logs', async () => {
    const mockClient = { query: vi.fn() };
    const details = {
      username: 'test',
      password: 'supersecretpassword123',
      token: 'jwt.token.here',
      action: 'login'
    };

    await AuditService.log('user-1', 'TEST_ACTION', 'auth', details, mockClient as never);

    const callArgs = mockClient.query.mock.calls[0];
    const loggedDetails = callArgs[1][3]; // 4th parameter is details

    expect(loggedDetails).toContain('"username":"test"');
    expect(loggedDetails).toContain('"password":"***"');
    expect(loggedDetails).toContain('"token":"***"');
    expect(loggedDetails).not.toContain('supersecretpassword123');
    expect(loggedDetails).not.toContain('jwt.token.here');
  });

  it('should not expose a delete method to ensure immutability', () => {
    expect((AuditService as unknown as Record<string, unknown>).delete).toBeUndefined();
    expect((AuditService as unknown as Record<string, unknown>).remove).toBeUndefined();
    expect((AuditService as unknown as Record<string, unknown>).clear).toBeUndefined();
  });
});
