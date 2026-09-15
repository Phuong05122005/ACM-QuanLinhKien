import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse } from '@/lib/api';

describe('API Response Helpers', () => {
  it('should format success response correctly', async () => {
    const response = successResponse({ user: 'test' });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user).toBe('test');
  });

  it('should format error response correctly', async () => {
    const response = errorResponse('NOT_FOUND', 'User not found', 'userId', 404);
    const data = await response.json();
    
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('NOT_FOUND');
    expect(data.error?.message).toBe('User not found');
    expect(data.error.field).toBe('userId');
  });
});
