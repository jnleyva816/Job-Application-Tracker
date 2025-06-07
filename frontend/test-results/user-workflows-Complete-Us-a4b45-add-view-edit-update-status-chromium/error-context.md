# Test info

- Name: Complete User Workflows >> Job Application Management Workflow >> complete application lifecycle: add, view, edit, update status
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/user-workflows.spec.ts:104:5

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

    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/user-workflows.spec.ts:145:26
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
   45 |           { name: 'location', value: 'San Francisco, CA' },
   46 |           { name: 'phoneNumber', value: '(555) 123-4567' }
   47 |         ];
   48 |         
   49 |         for (const field of profileFields) {
   50 |           const input = page.locator(`input[name="${field.name}"], textarea[name="${field.name}"]`);
   51 |           if (await input.count() > 0) {
   52 |             await input.fill(field.value);
   53 |           }
   54 |         }
   55 |         
   56 |         // Submit profile setup
   57 |         const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Complete")');
   58 |         if (await submitButton.count() > 0) {
   59 |           await submitButton.click();
   60 |           
   61 |           // Should now be on dashboard
   62 |           await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
   63 |         }
   64 |       }
   65 |       
   66 |       // Verify successful setup
   67 |       await expect(page.locator('h1, h2').first()).toBeVisible();
   68 |     });
   69 |   });
   70 |
   71 |   test.describe('Job Application Management Workflow', () => {
   72 |     test.beforeEach(async ({ page }) => {
   73 |       // Try to login, but continue even if it fails (no backend)
   74 |       await page.goto('/login');
   75 |       await page.fill('input[name="username"]', 'testuser');
   76 |       await page.fill('input[name="password"]', 'Password123!!');
   77 |       await page.click('button[type="submit"]');
   78 |       
   79 |       // Wait to see what happens
   80 |       await page.waitForTimeout(2000);
   81 |       
   82 |       // Tests will adapt based on authentication state
   83 |     });
   84 |
   85 |     test('should handle authentication flow for application management', async ({ page }) => {
   86 |       if (page.url().includes('/login')) {
   87 |         // Not authenticated - test that protected routes redirect
   88 |         await page.goto('/add-application');
   89 |         await expect(page).toHaveURL(/.*\/login/);
   90 |         
   91 |         await page.goto('/applications');
   92 |         await expect(page).toHaveURL(/.*\/login/);
   93 |         
   94 |         // Should show login form
   95 |         await expect(page.locator('input[name="username"]')).toBeVisible();
   96 |         await expect(page.locator('input[name="password"]')).toBeVisible();
   97 |       } else {
   98 |         // Authenticated - can access application management
   99 |         await page.goto('/applications');
  100 |         await expect(page.locator('h1, h2').first()).toBeVisible();
  101 |       }
  102 |     });
  103 |
  104 |     test('complete application lifecycle: add, view, edit, update status', async ({ page }) => {
  105 |       // Step 1: Add new application
  106 |       await page.goto('/add-application');
  107 |       
  108 |       const testApplication = {
  109 |         company: `Test Company ${Date.now()}`,
  110 |         position: 'Senior Software Engineer',
  111 |         location: 'Remote',
  112 |         salary: '120000',
  113 |         status: 'Applied',
  114 |         jobUrl: 'https://example.com/job',
  115 |         description: 'This is a test job application for E2E testing.'
  116 |       };
  117 |       
  118 |       // Fill application form
  119 |       for (const [fieldName, value] of Object.entries(testApplication)) {
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
> 145 |       await expect(page).toHaveURL(/.*\/applications/, { timeout: 10000 });
      |                          ^ Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)
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
  220 |         await page.fill('input[name="company"]', app.company);
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
```