# Test info

- Name: Dashboard Functionality >> Responsive Design >> should be responsive on mobile devices
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/dashboard.spec.ts:220:5

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('h1')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('h1')

    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/dashboard.spec.ts:225:40
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
  149 |       // If no dedicated add button, check if we can navigate to applications page
  150 |       if (!addButtonFound) {
  151 |         await page.goto('/applications');
  152 |         await expect(page).toHaveURL(/.*\/applications/);
  153 |       }
  154 |     });
  155 |
  156 |     test('should display recent applications section', async ({ page }) => {
  157 |       // Check for recent applications section
  158 |       const recentSectionExists = await page.locator('text=Recent Applications').count() > 0 ||
  159 |                                  await page.locator('h2:has-text("Recent")').count() > 0 ||
  160 |                                  await page.locator('h3:has-text("Applications")').count() > 0;
  161 |       
  162 |       if (recentSectionExists) {
  163 |         expect(recentSectionExists).toBe(true);
  164 |         
  165 |         // Check if applications are displayed or if there's an empty state
  166 |         const hasApplications = await page.locator('.application-item').count() > 0 ||
  167 |                                await page.locator('[data-testid="application"]').count() > 0;
  168 |         
  169 |         const hasEmptyState = await page.locator('text=No applications yet').count() > 0 ||
  170 |                              await page.locator('text=Get started').count() > 0;
  171 |         
  172 |         // Either should have applications or empty state
  173 |         expect(hasApplications || hasEmptyState).toBe(true);
  174 |       }
  175 |     });
  176 |   });
  177 |
  178 |   test.describe('Statistics Overview', () => {
  179 |     test('should display application statistics', async ({ page }) => {
  180 |       // Look for statistics cards or numbers
  181 |       const statsIndicators = [
  182 |         'Total Applications',
  183 |         'Pending',
  184 |         'Interviews',
  185 |         'Offers',
  186 |         'Rejected'
  187 |       ];
  188 |
  189 |       for (const stat of statsIndicators) {
  190 |         const statExists = await page.locator(`text=${stat}`).count() > 0 ||
  191 |                           await page.locator(`[data-testid="${stat.toLowerCase()}"]`).count() > 0;
  192 |         
  193 |         if (statExists) {
  194 |           expect(statExists).toBe(true);
  195 |         }
  196 |       }
  197 |     });
  198 |
  199 |     test('should have clickable stats that navigate to detailed views', async ({ page }) => {
  200 |       // Try to find and click on statistics that should navigate to other pages
  201 |       const clickableStats = [
  202 |         { selector: 'text=View All Applications', expectedUrl: '/applications' },
  203 |         { selector: 'text=View Statistics', expectedUrl: '/statistics' },
  204 |         { selector: '[data-testid="view-applications"]', expectedUrl: '/applications' }
  205 |       ];
  206 |
  207 |       for (const stat of clickableStats) {
  208 |         if (await page.locator(stat.selector).count() > 0) {
  209 |           await page.locator(stat.selector).click();
  210 |           await expect(page).toHaveURL(new RegExp(`.*${stat.expectedUrl}`));
  211 |           
  212 |           // Navigate back to dashboard
  213 |           await page.goto('/dashboard');
  214 |         }
  215 |       }
  216 |     });
  217 |   });
  218 |
  219 |   test.describe('Responsive Design', () => {
  220 |     test('should be responsive on mobile devices', async ({ page }) => {
  221 |       // Set mobile viewport
  222 |       await page.setViewportSize({ width: 375, height: 667 });
  223 |       
  224 |       // Dashboard should still be accessible and readable
> 225 |       await expect(page.locator('h1')).toBeVisible();
      |                                        ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  226 |       
  227 |       // Navigation should adapt (might be hamburger menu)
  228 |       const mobileNav = page.locator('[data-testid="mobile-menu"], .hamburger-menu, button[aria-label="Menu"]');
  229 |       const desktopNav = page.locator('nav');
  230 |       
  231 |       // Either mobile nav should be visible or desktop nav should still work
  232 |       const hasNavigation = await mobileNav.count() > 0 || await desktopNav.isVisible();
  233 |       expect(hasNavigation).toBe(true);
  234 |     });
  235 |
  236 |     test('should be responsive on tablet devices', async ({ page }) => {
  237 |       // Set tablet viewport
  238 |       await page.setViewportSize({ width: 768, height: 1024 });
  239 |       
  240 |       // Dashboard should be fully functional
  241 |       await expect(page.locator('h1')).toBeVisible();
  242 |       await expect(page.locator('nav')).toBeVisible();
  243 |     });
  244 |   });
  245 |
  246 |   test.describe('Data Loading', () => {
  247 |     test('should handle loading states gracefully', async ({ page }) => {
  248 |       // Reload the page to trigger loading states
  249 |       await page.reload();
  250 |       
  251 |       // Check what state we're in after reload
  252 |       if (page.url().includes('/login')) {
  253 |         // If on login page, that's expected - check that login form is visible
  254 |         await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10000 });
  255 |         await expect(page.locator('input[name="password"]')).toBeVisible();
  256 |       } else {
  257 |         // If authenticated, check for page content
  258 |         await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  259 |       }
  260 |     });
  261 |
  262 |     test('should handle empty states appropriately', async ({ page }) => {
  263 |       // Look for empty state messages
  264 |       const emptyStates = [
  265 |         'text=No applications yet',
  266 |         'text=Get started by adding your first application',
  267 |         'text=No data available',
  268 |         '[data-testid="empty-state"]'
  269 |       ];
  270 |
  271 |       // Check if any empty states are handled properly
  272 |       for (const emptyState of emptyStates) {
  273 |         if (await page.locator(emptyState).count() > 0) {
  274 |           await expect(page.locator(emptyState)).toBeVisible();
  275 |         }
  276 |       }
  277 |     });
  278 |   });
  279 | }); 
```