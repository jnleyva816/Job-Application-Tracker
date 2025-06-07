# Test info

- Name: Statistics and Analytics >> Statistics Page Layout >> should display statistics page with proper layout
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/statistics.spec.ts:39:5

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected pattern: /.*\/statistics/
Received string:  "http://localhost:5173/login"
Call log:
  - expect.toHaveURL with timeout 10000ms
  - waiting for locator(':root')
    14 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:5173/login"

    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/statistics.spec.ts:40:26
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
   3 | test.describe('Statistics and Analytics', () => {
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
   16 |       // Test that accessing statistics redirects to login
   17 |       await page.goto('/statistics');
   18 |       await expect(page).toHaveURL(/.*\/login/);
   19 |     }
   20 |   });
   21 |
   22 |   test.describe('Statistics Page Layout', () => {
   23 |     test('should redirect to login when not authenticated, or show statistics page when authenticated', async ({ page }) => {
   24 |       if (page.url().includes('/login')) {
   25 |         // Not authenticated - should show login form
   26 |         await expect(page.locator('input[name="username"]')).toBeVisible();
   27 |         await expect(page.locator('input[name="password"]')).toBeVisible();
   28 |         await expect(page.locator('button[type="submit"]')).toBeVisible();
   29 |         
   30 |         // Verify that trying to access statistics redirects to login
   31 |         await page.goto('/statistics');
   32 |         await expect(page).toHaveURL(/.*\/login/);
   33 |       } else {
   34 |         // Authenticated - should show statistics page
   35 |         await expect(page.locator('h1, h2').first()).toBeVisible();
   36 |       }
   37 |     });
   38 |
   39 |     test('should display statistics page with proper layout', async ({ page }) => {
>  40 |       await expect(page).toHaveURL(/.*\/statistics/);
      |                          ^ Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)
   41 |       
   42 |       // Check for page title
   43 |       const pageTitle = page.locator('h1, h2').first();
   44 |       await expect(pageTitle).toBeVisible();
   45 |       
   46 |       // Check for main statistics content
   47 |       await expect(page.locator('main, .main-content, .statistics-container')).toBeVisible();
   48 |     });
   49 |
   50 |     test('should display key statistical metrics', async ({ page }) => {
   51 |       // Look for key metrics that should be displayed
   52 |       const keyMetrics = [
   53 |         'Total Applications',
   54 |         'Response Rate',
   55 |         'Interview Rate',
   56 |         'Success Rate',
   57 |         'Average Time',
   58 |         'Applications',
   59 |         'Interviews',
   60 |         'Offers',
   61 |         'Rejections'
   62 |       ];
   63 |
   64 |       for (const metric of keyMetrics) {
   65 |         const metricElement = page.locator(`text=${metric}`, { hasText: new RegExp(metric, 'i') });
   66 |         if (await metricElement.count() > 0) {
   67 |           await expect(metricElement.first()).toBeVisible();
   68 |         }
   69 |       }
   70 |
   71 |       // Check for numerical values (should have numbers displayed)
   72 |       const numberElements = page.locator('[data-testid*="count"], [data-testid*="number"], .metric-value, .stat-number');
   73 |       if (await numberElements.count() > 0) {
   74 |         await expect(numberElements.first()).toBeVisible();
   75 |       }
   76 |     });
   77 |
   78 |     test('should display statistical charts and visualizations', async ({ page }) => {
   79 |       // Wait for page to load completely
   80 |       await page.waitForLoadState('networkidle');
   81 |
   82 |       // Look for chart containers (common chart libraries)
   83 |       const chartSelectors = [
   84 |         'canvas',           // Chart.js, D3 with canvas
   85 |         'svg',              // D3, Recharts, other SVG-based charts
   86 |         '.chart',           // Custom chart containers
   87 |         '.graph',           // Graph containers
   88 |         '[data-testid*="chart"]',
   89 |         '[data-testid*="graph"]',
   90 |         '.recharts-wrapper', // Recharts specific
   91 |         '.chartjs-render-monitor', // Chart.js specific
   92 |         '.d3-chart'         // D3 specific
   93 |       ];
   94 |
   95 |       let chartsFound = false;
   96 |       for (const selector of chartSelectors) {
   97 |         const charts = page.locator(selector);
   98 |         const count = await charts.count();
   99 |         
  100 |         if (count > 0) {
  101 |           await expect(charts.first()).toBeVisible();
  102 |           chartsFound = true;
  103 |           
  104 |           // Verify charts have content (not empty)
  105 |           const chartBounds = await charts.first().boundingBox();
  106 |           expect(chartBounds?.width).toBeGreaterThan(0);
  107 |           expect(chartBounds?.height).toBeGreaterThan(0);
  108 |         }
  109 |       }
  110 |
  111 |       // If no charts found, check for empty state or loading state
  112 |       if (!chartsFound) {
  113 |         const emptyStateExists = await page.locator('text=No data, text=Loading, .empty-state, .loading').count() > 0;
  114 |         if (emptyStateExists) {
  115 |           expect(emptyStateExists).toBe(true);
  116 |         }
  117 |       }
  118 |     });
  119 |   });
  120 |
  121 |   test.describe('Chart Interactions', () => {
  122 |     test('should allow interaction with charts (tooltips, hover effects)', async ({ page }) => {
  123 |       await page.waitForLoadState('networkidle');
  124 |
  125 |       // Look for interactive chart elements
  126 |       const interactiveElements = [
  127 |         'canvas',
  128 |         'svg path',
  129 |         'svg rect',
  130 |         'svg circle',
  131 |         '.chart-bar',
  132 |         '.chart-slice',
  133 |         '.chart-point'
  134 |       ];
  135 |
  136 |       for (const selector of interactiveElements) {
  137 |         const elements = page.locator(selector);
  138 |         if (await elements.count() > 0) {
  139 |           // Try hovering over chart elements
  140 |           await elements.first().hover();
```