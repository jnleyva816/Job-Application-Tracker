# Test info

- Name: Complete User Workflows >> New User Journey >> complete user registration and setup workflow
- Location: /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/user-workflows.spec.ts:6:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
    at /home/jleyva/Documents/Java/Job-Application-Tracker/frontend/e2e-tests/user-workflows.spec.ts:37:45
```

# Page snapshot

```yaml
- heading "Create your account" [level=2]
- text: Username
- textbox "Username": newuser1749248063567
- text: Email address
- textbox "Email address": newuser1749248063567@example.com
- text: Password
- textbox "Password": Password123!!
- text: Confirm Password
- textbox "Confirm Password": Password123!!
- button "Creating account..." [disabled]
- text: Or
- link "Sign in to your account":
  - /url: /login
- button "Toggle theme": 🌙
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Complete User Workflows', () => {
   4 |   
   5 |   test.describe('New User Journey', () => {
   6 |     test('complete user registration and setup workflow', async ({ page }) => {
   7 |       // Start from homepage
   8 |       await page.goto('/');
   9 |       
   10 |       // Should redirect to login
   11 |       await expect(page).toHaveURL(/.*\/login/);
   12 |       
   13 |       // Navigate to registration
   14 |       await page.click('a[href="/register"]');
   15 |       await expect(page).toHaveURL(/.*\/register/);
   16 |       
   17 |       // Register new user
   18 |       const timestamp = Date.now();
   19 |       const testUser = {
   20 |         username: `newuser${timestamp}`,
   21 |         email: `newuser${timestamp}@example.com`,
   22 |         password: 'Password123!!'
   23 |       };
   24 |       
   25 |       await page.fill('input[name="username"]', testUser.username);
   26 |       await page.fill('input[name="email"]', testUser.email);
   27 |       await page.fill('input[name="password"]', testUser.password);
   28 |       await page.fill('input[name="confirmPassword"]', testUser.password);
   29 |       
   30 |       await page.click('button[type="submit"]');
   31 |       
   32 |       // Should redirect to profile setup or dashboard
   33 |       const finalUrl = page.url();
   34 |       const isProfileSetup = finalUrl.includes('/profile-setup');
   35 |       const isDashboard = finalUrl.includes('/dashboard');
   36 |       
>  37 |       expect(isProfileSetup || isDashboard).toBe(true);
      |                                             ^ Error: expect(received).toBe(expected) // Object.is equality
   38 |       
   39 |       // If redirected to profile setup, complete it
   40 |       if (isProfileSetup) {
   41 |         // Fill profile setup form
   42 |         const profileFields = [
   43 |           { name: 'firstName', value: 'Test' },
   44 |           { name: 'lastName', value: 'User' },
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
```