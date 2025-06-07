# Test info

- Name: Job Application Tracker >> should show register link
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/example.spec.ts:44:3

# Error details

```
Error: browserType.launch: Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome
Run "npx playwright install chrome"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Job Application Tracker', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Navigate to the application
   6 |     await page.goto('/');
   7 |   });
   8 |
   9 |   test('should redirect to login page when not authenticated', async ({ page }) => {
  10 |     // Should redirect to login page
  11 |     await expect(page).toHaveURL(/.*\/login/);
  12 |     await expect(page).toHaveTitle(/Job/);
  13 |   });
  14 |
  15 |   test('should display login form elements', async ({ page }) => {
  16 |     // Should be on login page
  17 |     await expect(page).toHaveURL(/.*\/login/);
  18 |     
  19 |     // Check for login form elements
  20 |     await expect(page.locator('input[name="username"]')).toBeVisible();
  21 |     await expect(page.locator('input[name="password"]')).toBeVisible();
  22 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  23 |   });
  24 |
  25 |   test('should be responsive on mobile', async ({ page }) => {
  26 |     // Set mobile viewport
  27 |     await page.setViewportSize({ width: 375, height: 667 });
  28 |     
  29 |     // Should redirect to login page and display properly
  30 |     await expect(page).toHaveURL(/.*\/login/);
  31 |     await expect(page.locator('body')).toBeVisible();
  32 |     await expect(page.locator('h2')).toContainText('Sign in to your account');
  33 |   });
  34 |
  35 |   test('should handle 404 pages gracefully', async ({ page }) => {
  36 |     // Navigate to non-existent page
  37 |     await page.goto('/non-existent-page');
  38 |     
  39 |     // Should still redirect to login page for unauthenticated users
  40 |     await expect(page).toHaveURL(/.*\/login/);
  41 |     await expect(page.locator('body')).toBeVisible();
  42 |   });
  43 |
> 44 |   test('should show register link', async ({ page }) => {
     |   ^ Error: browserType.launch: Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome
  45 |     // Should be on login page
  46 |     await expect(page).toHaveURL(/.*\/login/);
  47 |     
  48 |     // Check for register link
  49 |     await expect(page.locator('a[href="/register"]')).toBeVisible();
  50 |   });
  51 | }); 
```