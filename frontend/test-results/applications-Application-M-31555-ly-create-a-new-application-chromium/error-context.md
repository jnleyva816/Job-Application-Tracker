# Test info

- Name: Application Management >> Add New Application >> should successfully create a new application
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/applications.spec.ts:231:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/applications.spec.ts:273:51
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
  173 |       const addButtons = [
  174 |         'button:has-text("Add Application")',
  175 |         'a:has-text("Add Application")',
  176 |         'button:has-text("New Application")',
  177 |         'button:has-text("+")',
  178 |         '[data-testid="add-application"]'
  179 |       ];
  180 |
  181 |       for (const selector of addButtons) {
  182 |         if (await page.locator(selector).count() > 0) {
  183 |           await page.locator(selector).click();
  184 |           
  185 |           // Should navigate to add form page or show modal
  186 |           const isModal = await page.locator('.modal, [role="dialog"]').count() > 0;
  187 |           const isNewPage = page.url().includes('/add-application') || page.url().includes('/new');
  188 |           
  189 |           expect(isModal || isNewPage).toBe(true);
  190 |           break;
  191 |         }
  192 |       }
  193 |     });
  194 |
  195 |     test('should display add application form with required fields', async ({ page }) => {
  196 |       // Navigate to add application form
  197 |       await page.goto('/add-application');
  198 |       
  199 |       // Check for form fields
  200 |       const requiredFields = [
  201 |         { name: 'company', label: /company/i },
  202 |         { name: 'position', label: /position|title|role/i },
  203 |         { name: 'status', label: /status/i },
  204 |         { name: 'location', label: /location/i },
  205 |         { name: 'salary', label: /salary|compensation/i }
  206 |       ];
  207 |
  208 |       for (const field of requiredFields) {
  209 |         const inputSelectors = [
  210 |           `input[name="${field.name}"]`,
  211 |           `select[name="${field.name}"]`,
  212 |           `textarea[name="${field.name}"]`,
  213 |           `[data-testid="${field.name}"]`
  214 |         ];
  215 |
  216 |         for (const selector of inputSelectors) {
  217 |           if (await page.locator(selector).count() > 0) {
  218 |             await expect(page.locator(selector)).toBeVisible();
  219 |             break;
  220 |           }
  221 |         }
  222 |       }
  223 |
  224 |       // Check for submit button
  225 |       const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")');
  226 |       if (await submitButton.count() > 0) {
  227 |         await expect(submitButton.first()).toBeVisible();
  228 |       }
  229 |     });
  230 |
  231 |     test('should successfully create a new application', async ({ page }) => {
  232 |       await page.goto('/add-application');
  233 |       
  234 |       // Fill out the form with test data
  235 |       const testData = {
  236 |         company: `Test Company ${Date.now()}`,
  237 |         position: 'Software Engineer',
  238 |         location: 'San Francisco, CA',
  239 |         status: 'Applied'
  240 |       };
  241 |
  242 |       // Fill required fields if they exist
  243 |       for (const [fieldName, value] of Object.entries(testData)) {
  244 |         const fieldSelectors = [
  245 |           `input[name="${fieldName}"]`,
  246 |           `select[name="${fieldName}"]`,
  247 |           `textarea[name="${fieldName}"]`
  248 |         ];
  249 |
  250 |         for (const selector of fieldSelectors) {
  251 |           if (await page.locator(selector).count() > 0) {
  252 |             const field = page.locator(selector);
  253 |             if (await field.getAttribute('type') === 'select' || await field.locator('option').count() > 0) {
  254 |               await field.selectOption({ label: value });
  255 |             } else {
  256 |               await field.fill(value);
  257 |             }
  258 |             break;
  259 |           }
  260 |         }
  261 |       }
  262 |
  263 |       // Submit the form
  264 |       const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")');
  265 |       if (await submitButton.count() > 0) {
  266 |         await submitButton.first().click();
  267 |         
  268 |         // Should navigate back to applications list or show success message
  269 |         await page.waitForTimeout(2000);
  270 |         const isBackToList = page.url().includes('/applications') && !page.url().includes('/add');
  271 |         const hasSuccessMessage = await page.locator('text=success, text=created, .success, .alert-success').count() > 0;
  272 |         
> 273 |         expect(isBackToList || hasSuccessMessage).toBe(true);
      |                                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  274 |       }
  275 |     });
  276 |
  277 |     test('should validate required fields', async ({ page }) => {
  278 |       await page.goto('/add-application');
  279 |       
  280 |       // Try to submit form without filling required fields
  281 |       const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")');
  282 |       if (await submitButton.count() > 0) {
  283 |         await submitButton.first().click();
  284 |         
  285 |         // Should show validation errors
  286 |         const validationSelectors = [
  287 |           '.error',
  288 |           '.invalid',
  289 |           '[role="alert"]',
  290 |           'text=required',
  291 |           'text=Please fill',
  292 |           '.text-red-500'
  293 |         ];
  294 |
  295 |         let validationFound = false;
  296 |         for (const selector of validationSelectors) {
  297 |           if (await page.locator(selector).count() > 0) {
  298 |             validationFound = true;
  299 |             break;
  300 |           }
  301 |         }
  302 |
  303 |         // HTML5 validation might also work
  304 |         const invalidInputs = await page.locator('input:invalid').count();
  305 |         expect(validationFound || invalidInputs > 0).toBe(true);
  306 |       }
  307 |     });
  308 |   });
  309 |
  310 |   test.describe('Application Details', () => {
  311 |     test('should view application details', async ({ page }) => {
  312 |       // Wait for applications to load
  313 |       await page.waitForLoadState('networkidle');
  314 |
  315 |       // Look for clickable application items
  316 |       const applicationSelectors = [
  317 |         '.application-item a',
  318 |         '[data-testid="application"] a',
  319 |         'tbody tr td a',
  320 |         '.job-card a',
  321 |         'button[data-testid="view-details"]'
  322 |       ];
  323 |
  324 |       for (const selector of applicationSelectors) {
  325 |         if (await page.locator(selector).count() > 0) {
  326 |           await page.locator(selector).first().click();
  327 |           
  328 |           // Should navigate to detail page
  329 |           const isDetailPage = page.url().includes('/applications/') && page.url().match(/\/\d+/);
  330 |           if (isDetailPage) {
  331 |             // Check for detail page elements
  332 |             await expect(page.locator('h1, h2').first()).toBeVisible();
  333 |             break;
  334 |           }
  335 |         }
  336 |       }
  337 |     });
  338 |
  339 |     test('should allow editing application details', async ({ page }) => {
  340 |       // First create or find an application to edit
  341 |       await page.goto('/add-application');
  342 |       
  343 |       // Fill and submit a test application if form exists
  344 |       const testData = {
  345 |         company: `Edit Test Company ${Date.now()}`,
  346 |         position: 'Test Position'
  347 |       };
  348 |
  349 |       let applicationCreated = false;
  350 |       for (const [fieldName, value] of Object.entries(testData)) {
  351 |         const field = page.locator(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
  352 |         if (await field.count() > 0) {
  353 |           await field.first().fill(value);
  354 |           applicationCreated = true;
  355 |         }
  356 |       }
  357 |
  358 |       if (applicationCreated) {
  359 |         const submitButton = page.locator('button[type="submit"], button:has-text("Save")');
  360 |         if (await submitButton.count() > 0) {
  361 |           await submitButton.first().click();
  362 |           await page.waitForTimeout(2000);
  363 |         }
  364 |       }
  365 |
  366 |       // Navigate back to applications and look for edit functionality
  367 |       await page.goto('/applications');
  368 |       
  369 |       const editSelectors = [
  370 |         'button:has-text("Edit")',
  371 |         'a:has-text("Edit")',
  372 |         '[data-testid="edit"]',
  373 |         '.edit-button'
```