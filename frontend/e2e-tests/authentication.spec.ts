import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login Flow', () => {
    test('should display login form with proper elements', async ({ page }) => {
      // Should redirect to login page
      await expect(page).toHaveURL(/.*\/login/);

      // Check that login form elements exist
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Sign in');
    });

    test('should show error when login attempt fails (no backend)', async ({ page }) => {
      await expect(page).toHaveURL(/.*\/login/);

      // Fill in any credentials (will fail due to no backend)
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'Password123!!');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show some kind of error message (could be network error)
      await expect(page.locator('.bg-red-50, .error, [role="alert"]')).toBeVisible({ timeout: 15000 });
      
      // Should remain on login page
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should handle form submission without backend gracefully', async ({ page }) => {
      await expect(page).toHaveURL(/.*\/login/);

      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'Password123!!');
      
      // Submit and wait for response
      await page.click('button[type="submit"]');
      
      // Wait a moment to see if anything happens
      await page.waitForTimeout(2000);
      
      // Should either show error or stay on login page
      const isStillOnLogin = page.url().includes('/login');
      const hasErrorMessage = await page.locator('.bg-red-50, .error, [role="alert"]').count() > 0;
      
      expect(isStillOnLogin || hasErrorMessage).toBe(true);
    });

    test('should validate required fields', async ({ page }) => {
      await expect(page).toHaveURL(/.*\/login/);

      // Try to submit without filling fields
      await page.click('button[type="submit"]');
      
      // Should either show validation errors or HTML5 validation
      const hasValidationErrors = await page.locator('.error, .invalid, [role="alert"]').count() > 0;
      const hasInvalidInputs = await page.locator('input:invalid').count() > 0;
      
      expect(hasValidationErrors || hasInvalidInputs).toBe(true);
    });
  });

  test.describe('Registration Flow', () => {
    test('should navigate to registration page', async ({ page }) => {
      await expect(page).toHaveURL(/.*\/login/);
      
      // Click register link
      await page.click('a[href="/register"]');
      
      // Should be on register page
      await expect(page).toHaveURL(/.*\/register/);
      await expect(page.locator('h2')).toContainText('Create your account');
    });

    test('should show registration form elements', async ({ page }) => {
      await page.goto('/register');
      
      // Check form elements
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible(); 
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.locator('a[href="/login"]')).toBeVisible();
    });

    test('should register new user and redirect to profile setup', async ({ page }) => {
      await page.goto('/register');
      
      // Fill registration form
      const timestamp = Date.now();
      await page.fill('input[name="username"]', `testuser${timestamp}`);
      await page.fill('input[name="email"]', `test${timestamp}@example.com`);
      await page.fill('input[name="password"]', 'Password123!!!');
      await page.fill('input[name="confirmPassword"]', 'Password123!!!');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should redirect to profile setup
      await expect(page).toHaveURL(/.*\/profile-setup/, { timeout: 10000 });
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      await page.goto('/register');
      
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Password123!!!');
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!!!');
      
      await page.click('button[type="submit"]');
      
      // Should show password mismatch error
      await expect(page.locator('.bg-red-50')).toBeVisible();
      await expect(page.locator('.bg-red-50')).toContainText('Passwords do not match');
    });

    test('should navigate back to login from register page', async ({ page }) => {
      await page.goto('/register');
      
      // Click login link
      await page.click('a[href="/login"]');
      
      // Should be back on login page
      await expect(page).toHaveURL(/.*\/login/);
      await expect(page.locator('h2')).toContainText('Sign in to your account');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      const protectedPaths = ['/dashboard', '/applications', '/statistics', '/profile'];
      
      for (const path of protectedPaths) {
        await page.goto(path);
        await expect(page).toHaveURL(/.*\/login/);
      }
    });

    test('should show login form when accessing protected routes', async ({ page }) => {
      // Try to access a protected route
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/);
      
      // Should show login form
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Theme Toggle', () => {
    test('should toggle between light and dark themes', async ({ page }) => {
      await page.goto('/login');
      
      // Check for theme toggle button
      const themeToggle = page.locator('button[aria-label="Toggle theme"]');
      await expect(themeToggle).toBeVisible();
      
      // Initial state should be light theme (sun icon)
      await expect(themeToggle).toContainText('🌙');
      
      // Click to toggle to dark theme
      await themeToggle.click();
      await expect(themeToggle).toContainText('🌞');
      
      // Toggle back to light theme
      await themeToggle.click();
      await expect(themeToggle).toContainText('🌙');
    });
  });
}); 