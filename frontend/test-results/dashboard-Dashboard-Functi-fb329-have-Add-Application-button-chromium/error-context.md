# Test info

- Name: Dashboard Functionality >> Quick Actions >> should have Add Application button
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/dashboard.spec.ts:128:5

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

    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/dashboard.spec.ts:152:28
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
  149 |       // If no dedicated add button, check if we can navigate to applications page
  150 |       if (!addButtonFound) {
  151 |         await page.goto('/applications');
> 152 |         await expect(page).toHaveURL(/.*\/applications/);
      |                            ^ Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)
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
  225 |       await expect(page.locator('h1')).toBeVisible();
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
```