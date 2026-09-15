import { test, expect } from '@playwright/test';

test('has health endpoint', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
});
