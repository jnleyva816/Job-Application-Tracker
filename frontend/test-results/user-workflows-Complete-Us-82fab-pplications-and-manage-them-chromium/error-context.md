# Test info

- Name: Complete User Workflows >> Job Application Management Workflow >> batch operations workflow: create multiple applications and manage them
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/user-workflows.spec.ts:208:5

# Error details

```
TimeoutError: page.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input[name="company"]')

    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/user-workflows.spec.ts:220:20
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
  120 |         const fieldSelectors = [
  121 |           `input[name="${fieldName}"]`,
  122 |           `select[name="${fieldName}"]`,
  123 |           `textarea[name="${fieldName}"]`
  124 |         ];
  125 |         
  126 |         for (const selector of fieldSelectors) {
  127 |           if (await page.locator(selector).count() > 0) {
  128 |             const field = page.locator(selector);
  129 |             const tagName = await field.evaluate(el => el.tagName.toLowerCase());
  130 |             
  131 |             if (tagName === 'select') {
  132 |               await field.selectOption({ label: value });
  133 |             } else {
  134 |               await field.fill(value);
  135 |             }
  136 |             break;
  137 |           }
  138 |         }
  139 |       }
  140 |       
  141 |       // Submit application
  142 |       await page.click('button[type="submit"], button:has-text("Save")');
  143 |       
  144 |       // Should redirect to applications list
  145 |       await expect(page).toHaveURL(/.*\/applications/, { timeout: 10000 });
  146 |       
  147 |       // Step 2: Verify application appears in list
  148 |       await page.waitForLoadState('networkidle');
  149 |       await expect(page.locator(`text=${testApplication.company}`)).toBeVisible();
  150 |       
  151 |       // Step 3: View application details
  152 |       const applicationLink = page.locator(`text=${testApplication.company}`).first();
  153 |       if (await applicationLink.locator('..').locator('a').count() > 0) {
  154 |         await applicationLink.locator('..').locator('a').first().click();
  155 |       } else {
  156 |         await applicationLink.click();
  157 |       }
  158 |       
  159 |       // Should be on detail page
  160 |       const isDetailPage = page.url().includes('/applications/') || 
  161 |                           await page.locator('h1, h2').filter({ hasText: testApplication.company }).count() > 0;
  162 |       expect(isDetailPage).toBe(true);
  163 |       
  164 |       // Step 4: Edit application (if edit functionality exists)
  165 |       const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit"), [data-testid="edit"]');
  166 |       if (await editButton.count() > 0) {
  167 |         await editButton.click();
  168 |         
  169 |         // Update a field
  170 |         const salaryField = page.locator('input[name="salary"], input[name="expectedSalary"]');
  171 |         if (await salaryField.count() > 0) {
  172 |           await salaryField.clear();
  173 |           await salaryField.fill('130000');
  174 |         }
  175 |         
  176 |         // Save changes
  177 |         await page.click('button[type="submit"], button:has-text("Save")');
  178 |         
  179 |         // Should see updated value
  180 |         await expect(page.locator('text=130000')).toBeVisible({ timeout: 5000 });
  181 |       }
  182 |       
  183 |       // Step 5: Update application status
  184 |       const statusSelectors = [
  185 |         'select[name="status"]',
  186 |         '[data-testid="status-select"]',
  187 |         'button:has-text("Status")'
  188 |       ];
  189 |       
  190 |       for (const selector of statusSelectors) {
  191 |         if (await page.locator(selector).count() > 0) {
  192 |           const statusControl = page.locator(selector);
  193 |           
  194 |           if (await statusControl.locator('option').count() > 0) {
  195 |             await statusControl.selectOption('Interview Scheduled');
  196 |           } else {
  197 |             await statusControl.click();
  198 |             const interviewOption = page.locator('li:has-text("Interview"), option:has-text("Interview")');
  199 |             if (await interviewOption.count() > 0) {
  200 |               await interviewOption.first().click();
  201 |             }
  202 |           }
  203 |           break;
  204 |         }
  205 |       }
  206 |     });
  207 |
  208 |     test('batch operations workflow: create multiple applications and manage them', async ({ page }) => {
  209 |       const applications = [
  210 |         { company: 'Google', position: 'Software Engineer', status: 'Applied' },
  211 |         { company: 'Microsoft', position: 'Senior Developer', status: 'In Review' },
  212 |         { company: 'Apple', position: 'iOS Developer', status: 'Interview' }
  213 |       ];
  214 |       
  215 |       // Create multiple applications
  216 |       for (const app of applications) {
  217 |         await page.goto('/add-application');
  218 |         
  219 |         // Fill basic fields
> 220 |         await page.fill('input[name="company"]', app.company);
      |                    ^ TimeoutError: page.fill: Timeout 10000ms exceeded.
  221 |         await page.fill('input[name="position"]', app.position);
  222 |         
  223 |         // Set status if field exists
  224 |         const statusField = page.locator('select[name="status"]');
  225 |         if (await statusField.count() > 0) {
  226 |           await statusField.selectOption(app.status);
  227 |         }
  228 |         
  229 |         await page.click('button[type="submit"]');
  230 |         await expect(page).toHaveURL(/.*\/applications/);
  231 |       }
  232 |       
  233 |       // Navigate to applications list
  234 |       await page.goto('/applications');
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
```