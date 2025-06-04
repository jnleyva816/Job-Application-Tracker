import { test, expect } from '@playwright/test';

test.describe('Job Application Tracker', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should redirect to login page when not authenticated', async ({ page }) => {
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page).toHaveTitle(/Job/);
  });

  test('should display login form elements', async ({ page }) => {
    // Should be on login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Check for login form elements
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should redirect to login page and display properly
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Sign in to your account');
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page');
    
    // Should still redirect to login page for unauthenticated users
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show register link', async ({ page }) => {
    // Should be on login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Check for register link
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });
}); 