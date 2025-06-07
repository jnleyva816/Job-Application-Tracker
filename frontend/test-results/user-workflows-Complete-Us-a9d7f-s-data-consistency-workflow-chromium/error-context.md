# Test info

- Name: Complete User Workflows >> Dashboard to Statistics Workflow >> statistics data consistency workflow
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/user-workflows.spec.ts:324:5

# Error details

```
TimeoutError: page.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input[name="company"]')

    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/user-workflows.spec.ts:335:18
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
  235 |       await page.waitForLoadState('networkidle');
  236 |       
  237 |       // Verify all applications are created
  238 |       for (const app of applications) {
  239 |         await expect(page.locator(`text=${app.company}`)).toBeVisible();
  240 |       }
  241 |       
  242 |       // Test bulk selection if available
  243 |       const checkboxes = page.locator('input[type="checkbox"]');
  244 |       if (await checkboxes.count() > 0) {
  245 |         // Select multiple applications
  246 |         await checkboxes.first().click();
  247 |         await checkboxes.nth(1).click();
  248 |         
  249 |         // Look for bulk actions
  250 |         const bulkActionButtons = page.locator('button:has-text("Delete"), button:has-text("Export"), button:has-text("Bulk")');
  251 |         if (await bulkActionButtons.count() > 0) {
  252 |           await expect(bulkActionButtons.first()).toBeVisible();
  253 |         }
  254 |       }
  255 |     });
  256 |   });
  257 |
  258 |   test.describe('Dashboard to Statistics Workflow', () => {
  259 |     test.beforeEach(async ({ page }) => {
  260 |       // Try to login, but continue even if it fails (no backend)
  261 |       await page.goto('/login');
  262 |       await page.fill('input[name="username"]', 'testuser');
  263 |       await page.fill('input[name="password"]', 'Password123!!');
  264 |       await page.click('button[type="submit"]');
  265 |       
  266 |       // Wait to see what happens
  267 |       await page.waitForTimeout(2000);
  268 |       
  269 |       // Tests will adapt based on authentication state
  270 |     });
  271 |
  272 |     test('should handle navigation workflow appropriately', async ({ page }) => {
  273 |       if (page.url().includes('/login')) {
  274 |         // Not authenticated - test that all protected routes redirect to login
  275 |         const protectedRoutes = ['/dashboard', '/applications', '/statistics', '/profile'];
  276 |         
  277 |         for (const route of protectedRoutes) {
  278 |           await page.goto(route);
  279 |           await expect(page).toHaveURL(/.*\/login/);
  280 |         }
  281 |         
  282 |         // Should show login form
  283 |         await expect(page.locator('input[name="username"]')).toBeVisible();
  284 |       } else {
  285 |         // Authenticated - can navigate between pages
  286 |         await page.goto('/dashboard');
  287 |         await expect(page.locator('h1, h2').first()).toBeVisible();
  288 |       }
  289 |     });
  290 |
  291 |     test('navigate from dashboard through all major sections', async ({ page }) => {
  292 |       // Start on dashboard
  293 |       await expect(page.locator('h1, h2').first()).toBeVisible();
  294 |       
  295 |       // Check dashboard stats
  296 |       const statsCards = page.locator('.stat-card, .metric-card, [data-testid*="stat"]');
  297 |       if (await statsCards.count() > 0) {
  298 |         await expect(statsCards.first()).toBeVisible();
  299 |       }
  300 |       
  301 |       // Navigate to Applications
  302 |       await page.goto('/applications');
  303 |       await expect(page.locator('h1, h2').first()).toBeVisible();
  304 |       
  305 |       // Navigate to Statistics
  306 |       await page.goto('/statistics');
  307 |       await expect(page.locator('h1, h2').first()).toBeVisible();
  308 |       
  309 |       // Check for charts
  310 |       const charts = page.locator('canvas, svg, .chart');
  311 |       if (await charts.count() > 0) {
  312 |         await expect(charts.first()).toBeVisible();
  313 |       }
  314 |       
  315 |       // Navigate to Profile
  316 |       await page.goto('/profile');
  317 |       await expect(page.locator('h1, h2').first()).toBeVisible();
  318 |       
  319 |       // Navigate back to Dashboard
  320 |       await page.goto('/dashboard');
  321 |       await expect(page.locator('h1, h2').first()).toBeVisible();
  322 |     });
  323 |
  324 |     test('statistics data consistency workflow', async ({ page }) => {
  325 |       // Create a test application to ensure we have data
  326 |       await page.goto('/add-application');
  327 |       
  328 |       const testApp = {
  329 |         company: `Stats Test ${Date.now()}`,
  330 |         position: 'Test Position',
  331 |         status: 'Applied'
  332 |       };
  333 |       
  334 |       // Fill and submit
> 335 |       await page.fill('input[name="company"]', testApp.company);
      |                  ^ TimeoutError: page.fill: Timeout 10000ms exceeded.
  336 |       await page.fill('input[name="position"]', testApp.position);
  337 |       
  338 |       const statusField = page.locator('select[name="status"]');
  339 |       if (await statusField.count() > 0) {
  340 |         await statusField.selectOption('Applied');
  341 |       }
  342 |       
  343 |       await page.click('button[type="submit"]');
  344 |       
  345 |       // Go to statistics page
  346 |       await page.goto('/statistics');
  347 |       await page.waitForLoadState('networkidle');
  348 |       
  349 |       // Check if statistics reflect the data
  350 |       const totalApps = page.locator('text=/Total.*Applications/i, [data-testid*="total"]');
  351 |       if (await totalApps.count() > 0) {
  352 |         await expect(totalApps.first()).toBeVisible();
  353 |       }
  354 |       
  355 |       // Navigate back to applications to verify count
  356 |       await page.goto('/applications');
  357 |       await page.waitForLoadState('networkidle');
  358 |       
  359 |       // Should see our test application
  360 |       await expect(page.locator(`text=${testApp.company}`)).toBeVisible();
  361 |     });
  362 |   });
  363 |
  364 |   test.describe('Error Handling and Edge Cases', () => {
  365 |     test('should handle network error and authentication appropriately', async ({ page }) => {
  366 |       // Try to login
  367 |       await page.goto('/login');
  368 |       await page.fill('input[name="username"]', 'testuser');
  369 |       await page.fill('input[name="password"]', 'Password123!!');
  370 |       await page.click('button[type="submit"]');
  371 |       
  372 |       // Wait to see what happens
  373 |       await page.waitForTimeout(2000);
  374 |       
  375 |       if (page.url().includes('/login')) {
  376 |         // Expected behavior - no backend available
  377 |         // Should show some error or stay on login page
  378 |         const hasError = await page.locator('.bg-red-50, .error, [role="alert"]').count() > 0;
  379 |         const isOnLogin = page.url().includes('/login');
  380 |         expect(hasError || isOnLogin).toBe(true);
  381 |       } else {
  382 |         // If somehow authenticated, test navigation
  383 |         await expect(page.locator('h1, h2').first()).toBeVisible();
  384 |       }
  385 |     });
  386 |
  387 |     test('should handle session and navigation appropriately', async ({ page }) => {
  388 |       // Start from login page
  389 |       await page.goto('/login');
  390 |       
  391 |       // Test navigation to register page
  392 |       await page.click('a[href="/register"]');
  393 |       await expect(page).toHaveURL(/.*\/register/);
  394 |       
  395 |       // Test navigation back to login
  396 |       await page.goto('/login');
  397 |       await expect(page).toHaveURL(/.*\/login/);
  398 |       
  399 |       // Test protected route access
  400 |       await page.goto('/dashboard');
  401 |       await expect(page).toHaveURL(/.*\/login/);
  402 |     });
  403 |   });
  404 |
  405 |   test.describe('Mobile User Experience Workflow', () => {
  406 |     test('should provide good mobile experience on login and registration', async ({ page }) => {
  407 |       // Set mobile viewport
  408 |       await page.setViewportSize({ width: 375, height: 667 });
  409 |       
  410 |       // Test login page on mobile
  411 |       await page.goto('/login');
  412 |       await expect(page.locator('input[name="username"]')).toBeVisible();
  413 |       await expect(page.locator('input[name="password"]')).toBeVisible();
  414 |       
  415 |       // Form should be usable on mobile
  416 |       const submitButton = page.locator('button[type="submit"]');
  417 |       await expect(submitButton).toBeVisible();
  418 |       
  419 |       // Button should fit in viewport
  420 |       const buttonBounds = await submitButton.boundingBox();
  421 |       expect(buttonBounds?.y).toBeLessThan(667);
  422 |       
  423 |       // Test navigation to register on mobile
  424 |       await page.click('a[href="/register"]');
  425 |       await expect(page).toHaveURL(/.*\/register/);
  426 |       await expect(page.locator('input[name="username"]')).toBeVisible();
  427 |     });
  428 |
  429 |     test('should handle mobile responsive design', async ({ page }) => {
  430 |       await page.setViewportSize({ width: 375, height: 667 });
  431 |       
  432 |       // Test various pages redirect properly to login on mobile
  433 |       const routes = ['/dashboard', '/applications', '/statistics'];
  434 |       
  435 |       for (const route of routes) {
```