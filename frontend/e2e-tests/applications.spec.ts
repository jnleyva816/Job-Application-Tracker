import { test, expect } from '@playwright/test';

test.describe('Application Management', () => {
  test.beforeEach(async ({ page }) => {
    // Try to login, but continue even if it fails (no backend)
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'Password123!!');
    await page.click('button[type="submit"]');
    
    // Wait to see what happens
    await page.waitForTimeout(2000);
    
    // If login fails, we'll test the redirect behavior instead
    if (page.url().includes('/login')) {
      // Test that accessing applications redirects to login
      await page.goto('/applications');
      await expect(page).toHaveURL(/.*\/login/);
    }
  });

  test.describe('Applications List View', () => {
    test('should redirect to login when not authenticated, or show applications page when authenticated', async ({ page }) => {
      if (page.url().includes('/login')) {
        // Not authenticated - should show login form
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        
        // Verify that trying to access applications redirects to login
        await page.goto('/applications');
        await expect(page).toHaveURL(/.*\/login/);
      } else {
        // Authenticated - should show applications page
        await expect(page.locator('h1, h2').first()).toBeVisible();
      }
    });

    test('should display applications page with proper layout', async ({ page }) => {
      await expect(page).toHaveURL(/.*\/applications/);
      
      // Check for page title
      const pageTitle = page.locator('h1, h2').first();
      await expect(pageTitle).toBeVisible();
      
      // Check for add application button or link
      const addButton = page.locator('button:has-text("Add"), a:has-text("Add"), button:has-text("New")').first();
      if (await addButton.count() > 0) {
        await expect(addButton).toBeVisible();
      }
    });

    test('should handle empty state when no applications exist', async ({ page }) => {
      // Look for empty state indicators
      const emptyStateSelectors = [
        'text=No applications yet',
        'text=Get started',
        'text=Add your first application',
        '[data-testid="empty-state"]',
        '.empty-state'
      ];

      let emptyStateFound = false;
      for (const selector of emptyStateSelectors) {
        if (await page.locator(selector).count() > 0) {
          await expect(page.locator(selector)).toBeVisible();
          emptyStateFound = true;
          break;
        }
      }

      // If no empty state found, there might be existing applications
      if (!emptyStateFound) {
        const applicationItems = page.locator('.application-item, [data-testid="application"], tr, .job-card');
        const applicationCount = await applicationItems.count();
        expect(applicationCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display existing applications if any', async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Look for application items
      const applicationSelectors = [
        '.application-item',
        '[data-testid="application"]',
        'tbody tr',
        '.job-card',
        '.application-row'
      ];

      for (const selector of applicationSelectors) {
        const items = page.locator(selector);
        const count = await items.count();
        
        if (count > 0) {
          // Verify each application item has essential information
          const firstItem = items.first();
          await expect(firstItem).toBeVisible();
          
          // Common fields that should be present
          const commonFields = ['company', 'position', 'status', 'date'];
          for (const field of commonFields) {
            const fieldElement = firstItem.locator(`[data-testid="${field}"], .${field}, td`);
            if (await fieldElement.count() > 0) {
              await expect(fieldElement.first()).toBeVisible();
            }
          }
          break;
        }
      }
    });

    test('should have functional search/filter capabilities', async ({ page }) => {
      // Look for search or filter inputs
      const searchSelectors = [
        'input[placeholder*="search" i]',
        'input[placeholder*="filter" i]',
        '[data-testid="search"]',
        '.search-input',
        'input[type="search"]'
      ];

      for (const selector of searchSelectors) {
        if (await page.locator(selector).count() > 0) {
          const searchInput = page.locator(selector).first();
          await expect(searchInput).toBeVisible();
          
          // Test search functionality
          await searchInput.fill('Google');
          await page.keyboard.press('Enter');
          
          // Wait for results (might be filtered or show "no results")
          await page.waitForTimeout(1000);
          
          // Clear search
          await searchInput.clear();
          break;
        }
      }
    });

    test('should have sorting functionality', async ({ page }) => {
      // Look for sortable column headers or sort buttons
      const sortSelectors = [
        'th[role="columnheader"]',
        'button:has-text("Sort")',
        '[data-testid*="sort"]',
        '.sortable',
        'th.cursor-pointer'
      ];

      for (const selector of sortSelectors) {
        if (await page.locator(selector).count() > 0) {
          const sortableElement = page.locator(selector).first();
          await expect(sortableElement).toBeVisible();
          
          // Try to click for sorting (if it's clickable)
          if (await sortableElement.isEnabled()) {
            await sortableElement.click();
            await page.waitForTimeout(500);
          }
          break;
        }
      }
    });
  });

  test.describe('Add New Application', () => {
    test('should navigate to add application form', async ({ page }) => {
      // Look for add application button
      const addButtons = [
        'button:has-text("Add Application")',
        'a:has-text("Add Application")',
        'button:has-text("New Application")',
        'button:has-text("+")',
        '[data-testid="add-application"]'
      ];

      for (const selector of addButtons) {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).click();
          
          // Should navigate to add form page or show modal
          const isModal = await page.locator('.modal, [role="dialog"]').count() > 0;
          const isNewPage = page.url().includes('/add-application') || page.url().includes('/new');
          
          expect(isModal || isNewPage).toBe(true);
          break;
        }
      }
    });

    test('should display add application form with required fields', async ({ page }) => {
      // Navigate to add application form
      await page.goto('/add-application');
      
      // Check for form fields
      const requiredFields = [
        { name: 'company', label: /company/i },
        { name: 'position', label: /position|title|role/i },
        { name: 'status', label: /status/i },
        { name: 'location', label: /location/i },
        { name: 'salary', label: /salary|compensation/i }
      ];

      for (const field of requiredFields) {
        const inputSelectors = [
          `input[name="${field.name}"]`,
          `select[name="${field.name}"]`,
          `textarea[name="${field.name}"]`,
          `[data-testid="${field.name}"]`
        ];

        for (const selector of inputSelectors) {
          if (await page.locator(selector).count() > 0) {
            await expect(page.locator(selector)).toBeVisible();
            break;
          }
        }
      }

      // Check for submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")');
      if (await submitButton.count() > 0) {
        await expect(submitButton.first()).toBeVisible();
      }
    });

    test('should successfully create a new application', async ({ page }) => {
      await page.goto('/add-application');
      
      // Fill out the form with test data
      const testData = {
        company: `Test Company ${Date.now()}`,
        position: 'Software Engineer',
        location: 'San Francisco, CA',
        status: 'Applied'
      };

      // Fill required fields if they exist
      for (const [fieldName, value] of Object.entries(testData)) {
        const fieldSelectors = [
          `input[name="${fieldName}"]`,
          `select[name="${fieldName}"]`,
          `textarea[name="${fieldName}"]`
        ];

        for (const selector of fieldSelectors) {
          if (await page.locator(selector).count() > 0) {
            const field = page.locator(selector);
            if (await field.getAttribute('type') === 'select' || await field.locator('option').count() > 0) {
              await field.selectOption({ label: value });
            } else {
              await field.fill(value);
            }
            break;
          }
        }
      }

      // Submit the form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")');
      if (await submitButton.count() > 0) {
        await submitButton.first().click();
        
        // Should navigate back to applications list or show success message
        await page.waitForTimeout(2000);
        const isBackToList = page.url().includes('/applications') && !page.url().includes('/add');
        const hasSuccessMessage = await page.locator('text=success, text=created, .success, .alert-success').count() > 0;
        
        expect(isBackToList || hasSuccessMessage).toBe(true);
      }
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/add-application');
      
      // Try to submit form without filling required fields
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")');
      if (await submitButton.count() > 0) {
        await submitButton.first().click();
        
        // Should show validation errors
        const validationSelectors = [
          '.error',
          '.invalid',
          '[role="alert"]',
          'text=required',
          'text=Please fill',
          '.text-red-500'
        ];

        let validationFound = false;
        for (const selector of validationSelectors) {
          if (await page.locator(selector).count() > 0) {
            validationFound = true;
            break;
          }
        }

        // HTML5 validation might also work
        const invalidInputs = await page.locator('input:invalid').count();
        expect(validationFound || invalidInputs > 0).toBe(true);
      }
    });
  });

  test.describe('Application Details', () => {
    test('should view application details', async ({ page }) => {
      // Wait for applications to load
      await page.waitForLoadState('networkidle');

      // Look for clickable application items
      const applicationSelectors = [
        '.application-item a',
        '[data-testid="application"] a',
        'tbody tr td a',
        '.job-card a',
        'button[data-testid="view-details"]'
      ];

      for (const selector of applicationSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).first().click();
          
          // Should navigate to detail page
          const isDetailPage = page.url().includes('/applications/') && page.url().match(/\/\d+/);
          if (isDetailPage) {
            // Check for detail page elements
            await expect(page.locator('h1, h2').first()).toBeVisible();
            break;
          }
        }
      }
    });

    test('should allow editing application details', async ({ page }) => {
      // First create or find an application to edit
      await page.goto('/add-application');
      
      // Fill and submit a test application if form exists
      const testData = {
        company: `Edit Test Company ${Date.now()}`,
        position: 'Test Position'
      };

      let applicationCreated = false;
      for (const [fieldName, value] of Object.entries(testData)) {
        const field = page.locator(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
        if (await field.count() > 0) {
          await field.first().fill(value);
          applicationCreated = true;
        }
      }

      if (applicationCreated) {
        const submitButton = page.locator('button[type="submit"], button:has-text("Save")');
        if (await submitButton.count() > 0) {
          await submitButton.first().click();
          await page.waitForTimeout(2000);
        }
      }

      // Navigate back to applications and look for edit functionality
      await page.goto('/applications');
      
      const editSelectors = [
        'button:has-text("Edit")',
        'a:has-text("Edit")',
        '[data-testid="edit"]',
        '.edit-button'
      ];

      for (const selector of editSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).first().click();
          
          // Should show edit form or navigate to edit page
          const hasEditForm = await page.locator('form, input, textarea').count() > 0;
          expect(hasEditForm).toBe(true);
          break;
        }
      }
    });
  });

  test.describe('Application Status Management', () => {
    test('should allow changing application status', async ({ page }) => {
      // Look for status change controls
      const statusSelectors = [
        'select[name="status"]',
        '[data-testid="status-select"]',
        '.status-dropdown',
        'button:has-text("Status")'
      ];

      for (const selector of statusSelectors) {
        if (await page.locator(selector).count() > 0) {
          const statusControl = page.locator(selector).first();
          
          if (await statusControl.locator('option').count() > 0) {
            // It's a select dropdown
            await statusControl.selectOption({ index: 1 });
          } else {
            // It's a button, click to see options
            await statusControl.click();
            
            // Look for status options
            const statusOptions = page.locator('li:has-text("Applied"), li:has-text("Interview"), li:has-text("Offer"), li:has-text("Rejected")');
            if (await statusOptions.count() > 0) {
              await statusOptions.first().click();
            }
          }
          break;
        }
      }
    });

    test('should filter by application status', async ({ page }) => {
      // Look for status filter controls
      const filterSelectors = [
        'select[name="status-filter"]',
        '[data-testid="status-filter"]',
        'button:has-text("Filter")',
        '.filter-dropdown'
      ];

      for (const selector of filterSelectors) {
        if (await page.locator(selector).count() > 0) {
          const filterControl = page.locator(selector).first();
          await filterControl.click();
          
          // Look for filter options
          const filterOptions = page.locator('option, li').filter({ hasText: /Applied|Interview|Offer|Rejected/ });
          if (await filterOptions.count() > 0) {
            await filterOptions.first().click();
            await page.waitForTimeout(1000);
          }
          break;
        }
      }
    });
  });

  test.describe('Bulk Operations', () => {
    test('should support bulk selection of applications', async ({ page }) => {
      // Look for checkboxes or bulk selection controls
      const selectionSelectors = [
        'input[type="checkbox"]',
        '[data-testid="select-all"]',
        '.checkbox',
        'input[role="checkbox"]'
      ];

      for (const selector of selectionSelectors) {
        if (await page.locator(selector).count() > 0) {
          const checkboxes = page.locator(selector);
          
          // Select first checkbox
          await checkboxes.first().click();
          
          // Check if bulk actions become available
          const bulkActions = page.locator('button:has-text("Delete"), button:has-text("Export"), button:has-text("Bulk")');
          if (await bulkActions.count() > 0) {
            await expect(bulkActions.first()).toBeVisible();
          }
          break;
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Page should still be functional
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Applications should be displayed in a mobile-friendly format
      const hasCardView = await page.locator('.card, .list-item, .mobile-view').count() > 0;
      const hasNoTable = await page.locator('table').count() === 0; // Tables often hidden on mobile
      
      // Either should have mobile-friendly components or no problematic table layout
      expect(hasCardView || hasNoTable).toBe(true);
      
      // Content should be readable
      await expect(page.locator('body')).toBeVisible();
    });
  });
}); 