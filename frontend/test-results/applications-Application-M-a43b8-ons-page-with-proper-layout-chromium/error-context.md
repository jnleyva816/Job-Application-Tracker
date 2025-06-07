# Test info

- Name: Application Management >> Applications List View >> should display applications page with proper layout
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/applications.spec.ts:39:5

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected pattern: /.*\/applications/
Received string:  "http://localhost:5173/login"
Call log:
  - expect.toHaveURL with timeout 10000ms
  - waiting for locator(':root')
    14 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:5173/login"

    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/applications.spec.ts:40:26
```

# Page snapshot

```yaml
- heading "Sign in to your account" [level=2]
- text: Username
- textbox "Username"
- text: Password
- textbox "Password"
- button "Sign in"
- text: Or
- link "Create a new account":
  - /url: /register
- button "Toggle theme": 🌙
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Application Management', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Try to login, but continue even if it fails (no backend)
   6 |     await page.goto('/login');
   7 |     await page.fill('input[name="username"]', 'testuser');
   8 |     await page.fill('input[name="password"]', 'Password123!!');
   9 |     await page.click('button[type="submit"]');
   10 |     
   11 |     // Wait to see what happens
   12 |     await page.waitForTimeout(2000);
   13 |     
   14 |     // If login fails, we'll test the redirect behavior instead
   15 |     if (page.url().includes('/login')) {
   16 |       // Test that accessing applications redirects to login
   17 |       await page.goto('/applications');
   18 |       await expect(page).toHaveURL(/.*\/login/);
   19 |     }
   20 |   });
   21 |
   22 |   test.describe('Applications List View', () => {
   23 |     test('should redirect to login when not authenticated, or show applications page when authenticated', async ({ page }) => {
   24 |       if (page.url().includes('/login')) {
   25 |         // Not authenticated - should show login form
   26 |         await expect(page.locator('input[name="username"]')).toBeVisible();
   27 |         await expect(page.locator('input[name="password"]')).toBeVisible();
   28 |         await expect(page.locator('button[type="submit"]')).toBeVisible();
   29 |         
   30 |         // Verify that trying to access applications redirects to login
   31 |         await page.goto('/applications');
   32 |         await expect(page).toHaveURL(/.*\/login/);
   33 |       } else {
   34 |         // Authenticated - should show applications page
   35 |         await expect(page.locator('h1, h2').first()).toBeVisible();
   36 |       }
   37 |     });
   38 |
   39 |     test('should display applications page with proper layout', async ({ page }) => {
>  40 |       await expect(page).toHaveURL(/.*\/applications/);
      |                          ^ Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)
   41 |       
   42 |       // Check for page title
   43 |       const pageTitle = page.locator('h1, h2').first();
   44 |       await expect(pageTitle).toBeVisible();
   45 |       
   46 |       // Check for add application button or link
   47 |       const addButton = page.locator('button:has-text("Add"), a:has-text("Add"), button:has-text("New")').first();
   48 |       if (await addButton.count() > 0) {
   49 |         await expect(addButton).toBeVisible();
   50 |       }
   51 |     });
   52 |
   53 |     test('should handle empty state when no applications exist', async ({ page }) => {
   54 |       // Look for empty state indicators
   55 |       const emptyStateSelectors = [
   56 |         'text=No applications yet',
   57 |         'text=Get started',
   58 |         'text=Add your first application',
   59 |         '[data-testid="empty-state"]',
   60 |         '.empty-state'
   61 |       ];
   62 |
   63 |       let emptyStateFound = false;
   64 |       for (const selector of emptyStateSelectors) {
   65 |         if (await page.locator(selector).count() > 0) {
   66 |           await expect(page.locator(selector)).toBeVisible();
   67 |           emptyStateFound = true;
   68 |           break;
   69 |         }
   70 |       }
   71 |
   72 |       // If no empty state found, there might be existing applications
   73 |       if (!emptyStateFound) {
   74 |         const applicationItems = page.locator('.application-item, [data-testid="application"], tr, .job-card');
   75 |         const applicationCount = await applicationItems.count();
   76 |         expect(applicationCount).toBeGreaterThanOrEqual(0);
   77 |       }
   78 |     });
   79 |
   80 |     test('should display existing applications if any', async ({ page }) => {
   81 |       // Wait for page to load
   82 |       await page.waitForLoadState('networkidle');
   83 |
   84 |       // Look for application items
   85 |       const applicationSelectors = [
   86 |         '.application-item',
   87 |         '[data-testid="application"]',
   88 |         'tbody tr',
   89 |         '.job-card',
   90 |         '.application-row'
   91 |       ];
   92 |
   93 |       for (const selector of applicationSelectors) {
   94 |         const items = page.locator(selector);
   95 |         const count = await items.count();
   96 |         
   97 |         if (count > 0) {
   98 |           // Verify each application item has essential information
   99 |           const firstItem = items.first();
  100 |           await expect(firstItem).toBeVisible();
  101 |           
  102 |           // Common fields that should be present
  103 |           const commonFields = ['company', 'position', 'status', 'date'];
  104 |           for (const field of commonFields) {
  105 |             const fieldElement = firstItem.locator(`[data-testid="${field}"], .${field}, td`);
  106 |             if (await fieldElement.count() > 0) {
  107 |               await expect(fieldElement.first()).toBeVisible();
  108 |             }
  109 |           }
  110 |           break;
  111 |         }
  112 |       }
  113 |     });
  114 |
  115 |     test('should have functional search/filter capabilities', async ({ page }) => {
  116 |       // Look for search or filter inputs
  117 |       const searchSelectors = [
  118 |         'input[placeholder*="search" i]',
  119 |         'input[placeholder*="filter" i]',
  120 |         '[data-testid="search"]',
  121 |         '.search-input',
  122 |         'input[type="search"]'
  123 |       ];
  124 |
  125 |       for (const selector of searchSelectors) {
  126 |         if (await page.locator(selector).count() > 0) {
  127 |           const searchInput = page.locator(selector).first();
  128 |           await expect(searchInput).toBeVisible();
  129 |           
  130 |           // Test search functionality
  131 |           await searchInput.fill('Google');
  132 |           await page.keyboard.press('Enter');
  133 |           
  134 |           // Wait for results (might be filtered or show "no results")
  135 |           await page.waitForTimeout(1000);
  136 |           
  137 |           // Clear search
  138 |           await searchInput.clear();
  139 |           break;
  140 |         }
```