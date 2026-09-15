import { test, expect } from '@playwright/test';

test.describe('Authentication & RBAC', () => {
  test('should show login page and allow login', async ({ page }) => {
    // Mock login API
    await page.route('/api/auth/login', async route => {
      const postData = route.request().postDataJSON();
      if (postData?.username === 'admin' && postData?.password === 'password') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { message: 'Logged in successfully' } })
        });
      } else if (postData?.username === 'locked') {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: { code: 'AUTH_ERROR', message: 'Account locked' } })
        });
      } else if (postData?.username === 'disabled') {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: { code: 'AUTH_ERROR', message: 'Account is disabled' } })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: { code: 'AUTH_ERROR', message: 'Invalid credentials' } })
        });
      }
    });

    await page.goto('/login');
    await expect(page.locator('h2')).toHaveText('Login to ACM');

    // Test invalid login
    await page.fill('[data-testid="username-input"]', 'bad');
    await page.fill('[data-testid="password-input"]', 'bad');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toHaveText('Invalid credentials');

    // Test disabled account
    await page.fill('[data-testid="username-input"]', 'disabled');
    await page.fill('[data-testid="password-input"]', 'bad');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toHaveText('Account is disabled');

    // Test locked account
    await page.fill('[data-testid="username-input"]', 'locked');
    await page.fill('[data-testid="password-input"]', 'bad');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toHaveText('Account locked');

    // Test success
    await page.fill('[data-testid="username-input"]', 'admin');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/');
  });

  test('should enforce RBAC on API routes', async ({ request }) => {
    // We cannot fully test the real server's session state if it requires DB for /api/auth/login,
    // but we can test that the API returns 401 when unauthenticated.
    const unauthRes = await request.post('/api/auth/logout');
    // Since logout calls getSession(), and there's no cookie, it won't crash and returns 200 actually.
    
    // Testing protected admin route
    const adminRes = await request.get('/api/admin/dashboard');
    expect(adminRes.status()).toBe(401); // Unauthorized because no token
  });
});
