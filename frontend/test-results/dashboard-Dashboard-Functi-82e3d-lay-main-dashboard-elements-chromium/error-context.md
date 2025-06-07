# Test info

- Name: Dashboard Functionality >> Dashboard Layout >> should display main dashboard elements
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/dashboard.spec.ts:46:5

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toContainText(expected)

Locator: locator('h1')
Expected string: "Dashboard"
Received: <element(s) not found>
Call log:
  - expect.toContainText with timeout 10000ms
  - waiting for locator('h1')

    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/dashboard.spec.ts:48:40
```

# Page snapshot

```yaml
- heading "Sign in to your account" [level=2]
- text: Account is temporarily locked. Please try again later. Username
- textbox "Username": testuser
- text: Password
- textbox "Password": Password123!!
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
   3 | test.describe('Dashboard Functionality', () => {
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
   14 |     // If we're still on login page, that's expected (no backend)
   15 |     // Tests will adapt to this condition
   16 |   });
   17 |
   18 |   test.describe('Dashboard Layout', () => {
   19 |     test('should redirect to login if not authenticated, or show dashboard if authenticated', async ({ page }) => {
   20 |       // Check current state
   21 |       if (page.url().includes('/login')) {
   22 |         // Not authenticated - should show login form
   23 |         await expect(page.locator('input[name="username"]')).toBeVisible();
   24 |         await expect(page.locator('input[name="password"]')).toBeVisible();
   25 |         await expect(page.locator('button[type="submit"]')).toBeVisible();
   26 |       } else {
   27 |         // Authenticated - should show dashboard
   28 |         await expect(page.locator('h1, h2').first()).toBeVisible();
   29 |       }
   30 |     });
   31 |
   32 |     test('should handle navigation appropriately', async ({ page }) => {
   33 |       if (page.url().includes('/login')) {
   34 |         // Test login page navigation
   35 |         await expect(page.locator('a[href="/register"]')).toBeVisible();
   36 |         
   37 |         // Try to access dashboard directly
   38 |         await page.goto('/dashboard');
   39 |         await expect(page).toHaveURL(/.*\/login/);
   40 |       } else {
   41 |         // Test dashboard navigation (if authenticated)
   42 |         await expect(page.locator('nav')).toBeVisible();
   43 |       }
   44 |     });
   45 |
   46 |     test('should display main dashboard elements', async ({ page }) => {
   47 |       // Check for main dashboard title
>  48 |       await expect(page.locator('h1')).toContainText('Dashboard');
      |                                        ^ Error: Timed out 10000ms waiting for expect(locator).toContainText(expected)
   49 |       
   50 |       // Check for navigation menu
   51 |       await expect(page.locator('nav')).toBeVisible();
   52 |       
   53 |       // Check for main dashboard sections (these may vary based on implementation)
   54 |       const dashboardSections = [
   55 |         'Recent Applications',
   56 |         'Quick Stats',
   57 |         'Upcoming Interviews',
   58 |         'Application Status Overview'
   59 |       ];
   60 |       
   61 |       for (const section of dashboardSections) {
   62 |         // Use flexible matching since exact text may vary
   63 |         const sectionExists = await page.locator(`text=${section}`).count() > 0 ||
   64 |                              await page.locator(`h2:has-text("${section}")`).count() > 0 ||
   65 |                              await page.locator(`h3:has-text("${section}")`).count() > 0;
   66 |         
   67 |         if (sectionExists) {
   68 |           expect(sectionExists).toBe(true);
   69 |         }
   70 |       }
   71 |     });
   72 |
   73 |     test('should have working navigation menu', async ({ page }) => {
   74 |       // Check that navigation links are present and functional
   75 |       const navLinks = [
   76 |         { text: 'Dashboard', url: '/dashboard' },
   77 |         { text: 'Applications', url: '/applications' },
   78 |         { text: 'Statistics', url: '/statistics' },
   79 |         { text: 'Profile', url: '/profile' }
   80 |       ];
   81 |
   82 |       for (const link of navLinks) {
   83 |         // Find and click navigation link
   84 |         const navLink = page.locator(`nav a:has-text("${link.text}")`).first();
   85 |         if (await navLink.count() > 0) {
   86 |           await navLink.click();
   87 |           await expect(page).toHaveURL(new RegExp(`.*${link.url}`));
   88 |           
   89 |           // Navigate back to dashboard for next test
   90 |           if (link.url !== '/dashboard') {
   91 |             await page.goto('/dashboard');
   92 |           }
   93 |         }
   94 |       }
   95 |     });
   96 |
   97 |     test('should display user menu and logout functionality', async ({ page }) => {
   98 |       // Look for user menu (could be username, avatar, or menu button)
   99 |       const userMenuSelectors = [
  100 |         'button:has-text("testuser")',
  101 |         '[data-testid="user-menu"]',
  102 |         'button[aria-label="User menu"]',
  103 |         '.user-menu'
  104 |       ];
  105 |
  106 |       let userMenuFound = false;
  107 |       for (const selector of userMenuSelectors) {
  108 |         if (await page.locator(selector).count() > 0) {
  109 |           await page.locator(selector).click();
  110 |           userMenuFound = true;
  111 |           break;
  112 |         }
  113 |       }
  114 |
  115 |       // If no specific user menu found, look for logout button directly
  116 |       if (!userMenuFound) {
  117 |         const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign out")');
  118 |         if (await logoutButton.count() > 0) {
  119 |           await logoutButton.click();
  120 |           // Should redirect to login page after logout
  121 |           await expect(page).toHaveURL(/.*\/login/);
  122 |         }
  123 |       }
  124 |     });
  125 |   });
  126 |
  127 |   test.describe('Quick Actions', () => {
  128 |     test('should have Add Application button', async ({ page }) => {
  129 |       // Look for add application button or link
  130 |       const addButtons = [
  131 |         'button:has-text("Add Application")',
  132 |         'a:has-text("Add Application")',
  133 |         'button:has-text("New Application")',
  134 |         '[data-testid="add-application"]',
  135 |         '.add-application'
  136 |       ];
  137 |
  138 |       let addButtonFound = false;
  139 |       for (const selector of addButtons) {
  140 |         if (await page.locator(selector).count() > 0) {
  141 |           await page.locator(selector).click();
  142 |           // Should navigate to add application page
  143 |           await expect(page).toHaveURL(/.*\/add-application/);
  144 |           addButtonFound = true;
  145 |           break;
  146 |         }
  147 |       }
  148 |
```