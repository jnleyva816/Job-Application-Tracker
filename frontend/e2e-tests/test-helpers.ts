import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for E2E tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Login with default test user credentials
   */
  async loginAsTestUser() {
    await this.page.goto('/login');
    await this.page.fill('input[name="username"]', 'testuser');
    await this.page.fill('input[name="password"]', 'Password123!!');
    await this.page.click('button[type="submit"]');
    await expect(this.page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  }

  /**
   * Register a new user with unique credentials
   */
  async registerNewUser(suffix?: string) {
    const timestamp = suffix || Date.now().toString();
    const userData = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'Password123!!'
    };

    await this.page.goto('/register');
    await this.page.fill('input[name="username"]', userData.username);
    await this.page.fill('input[name="email"]', userData.email);
    await this.page.fill('input[name="password"]', userData.password);
    await this.page.fill('input[name="confirmPassword"]', userData.password);
    await this.page.click('button[type="submit"]');

    return userData;
  }

  /**
   * Create a test application with default or custom data
   */
  async createTestApplication(customData?: Partial<ApplicationData>) {
    const defaultData: ApplicationData = {
      company: `Test Company ${Date.now()}`,
      position: 'Software Engineer',
      location: 'San Francisco, CA',
      salary: '120000',
      status: 'Applied',
      ...customData
    };

    await this.page.goto('/add-application');

    // Fill form fields
    for (const [fieldName, value] of Object.entries(defaultData)) {
      const fieldSelectors = [
        `input[name="${fieldName}"]`,
        `select[name="${fieldName}"]`,
        `textarea[name="${fieldName}"]`
      ];

      for (const selector of fieldSelectors) {
        if (await this.page.locator(selector).count() > 0) {
          const field = this.page.locator(selector);
          const tagName = await field.evaluate(el => el.tagName.toLowerCase());

          if (tagName === 'select') {
            await field.selectOption({ label: value });
          } else {
            await field.fill(value);
          }
          break;
        }
      }
    }

    await this.page.click('button[type="submit"]');
    await expect(this.page).toHaveURL(/.*\/applications/, { timeout: 10000 });

    return defaultData;
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if element exists and is visible
   */
  async elementExists(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    const count = await element.count();
    return count > 0 && await element.first().isVisible();
  }

  /**
   * Click on element if it exists
   */
  async clickIfExists(selector: string): Promise<boolean> {
    if (await this.elementExists(selector)) {
      await this.page.locator(selector).first().click();
      return true;
    }
    return false;
  }

  /**
   * Fill field if it exists
   */
  async fillIfExists(selector: string, value: string): Promise<boolean> {
    if (await this.elementExists(selector)) {
      await this.page.locator(selector).first().fill(value);
      return true;
    }
    return false;
  }

  /**
   * Navigate through common user workflows
   */
  async navigateToSection(section: 'dashboard' | 'applications' | 'statistics' | 'profile') {
    await this.page.goto(`/${section}`);
    await this.waitForPageLoad();
    await expect(this.page.locator('h1, h2').first()).toBeVisible();
  }

  /**
   * Check for common error states
   */
  async checkForErrors(): Promise<string[]> {
    const errorSelectors = [
      '.error',
      '.invalid',
      '[role="alert"]',
      '.text-red-500',
      '.bg-red-50'
    ];

    const errors: string[] = [];
    for (const selector of errorSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < count; i++) {
        const text = await elements.nth(i).textContent();
        if (text && text.trim()) {
          errors.push(text.trim());
        }
      }
    }

    return errors;
  }

  /**
   * Set viewport for mobile testing
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Set viewport for tablet testing
   */
  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  /**
   * Set viewport for desktop testing
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Simulate slow network conditions
   */
  async simulateSlowNetwork() {
    const context = this.page.context();
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
  }

  /**
   * Clear all browser storage
   */
  async clearBrowserStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Check responsive design elements
   */
  async checkResponsiveElements() {
    const responsiveChecks = {
      hasHorizontalScroll: false,
      elementsOverflow: false,
      textReadable: true
    };

    // Check for horizontal scroll
    const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await this.page.evaluate(() => window.innerWidth);
    responsiveChecks.hasHorizontalScroll = bodyWidth > viewportWidth;

    // Check if key elements are visible and sized properly
    const keyElements = ['h1, h2', 'nav', 'main', 'button[type="submit"]'];
    for (const selector of keyElements) {
      if (await this.elementExists(selector)) {
        const element = this.page.locator(selector).first();
        const boundingBox = await element.boundingBox();
        
        if (boundingBox && boundingBox.width > viewportWidth) {
          responsiveChecks.elementsOverflow = true;
        }
      }
    }

    return responsiveChecks;
  }

  /**
   * Wait for charts to load (for statistics page)
   */
  async waitForChartsToLoad() {
    const chartSelectors = [
      'canvas',
      'svg',
      '.chart',
      '.graph',
      '[data-testid*="chart"]'
    ];

    for (const selector of chartSelectors) {
      if (await this.elementExists(selector)) {
        // Wait for chart to have content
        await this.page.waitForFunction(
          (sel) => {
            const element = document.querySelector(sel);
            if (!element) return false;
            
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          },
          selector,
          { timeout: 10000 }
        );
        break;
      }
    }
  }

  /**
   * Check accessibility basics
   */
  async checkBasicAccessibility() {
    const accessibilityIssues: string[] = [];

    // Check for alt text on images
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (!alt) {
        accessibilityIssues.push(`Image ${i + 1} missing alt text`);
      }
    }

    // Check for form labels
    const inputs = this.page.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      
      if (id) {
        const label = this.page.locator(`label[for="${id}"]`);
        if (await label.count() === 0 && !ariaLabel) {
          accessibilityIssues.push(`Input ${i + 1} missing associated label`);
        }
      } else if (!ariaLabel) {
        accessibilityIssues.push(`Input ${i + 1} missing label or aria-label`);
      }
    }

    return accessibilityIssues;
  }

  /**
   * Login with default test user credentials (may fail without backend)
   */
  async attemptLogin() {
    await this.page.goto('/login');
    await this.page.fill('input[name="username"]', 'testuser');
    await this.page.fill('input[name="password"]', 'Password123!!');
    await this.page.click('button[type="submit"]');
    
    // Wait a moment to see what happens
    await this.page.waitForTimeout(2000);
    
    // Return whether login was successful
    return this.page.url().includes('/dashboard');
  }

  /**
   * Check if user is authenticated (on dashboard or protected route)
   */
  async isAuthenticated(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/dashboard') || 
           url.includes('/applications') || 
           url.includes('/statistics') || 
           url.includes('/profile');
  }
}

/**
 * Application data interface
 */
export interface ApplicationData {
  company: string;
  position: string;
  location?: string;
  salary?: string;
  status?: string;
  jobUrl?: string;
  description?: string;
}

/**
 * User data interface
 */
export interface UserData {
  username: string;
  email: string;
  password: string;
}

/**
 * Common test data generators
 */
export class TestDataGenerator {
  static createUniqueUser(): UserData {
    const timestamp = Date.now();
    return {
      username: `user${timestamp}`,
      email: `user${timestamp}@example.com`,
      password: 'testpass123'
    };
  }

  static createTestApplication(overrides?: Partial<ApplicationData>): ApplicationData {
    const timestamp = Date.now();
    return {
      company: `Company ${timestamp}`,
      position: 'Software Developer',
      location: 'Remote',
      salary: '100000',
      status: 'Applied',
      ...overrides
    };
  }

  static getRandomCompanies(): string[] {
    return [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta',
      'Netflix', 'Spotify', 'Uber', 'Airbnb', 'Tesla',
      'Salesforce', 'Adobe', 'Oracle', 'IBM', 'Intel'
    ];
  }

  static getRandomPositions(): string[] {
    return [
      'Software Engineer', 'Senior Developer', 'Full Stack Developer',
      'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
      'Data Scientist', 'Product Manager', 'QA Engineer',
      'Mobile Developer', 'UI/UX Designer', 'System Administrator'
    ];
  }

  static getApplicationStatuses(): string[] {
    return [
      'Applied', 'In Review', 'Phone Screen', 'Technical Interview',
      'On-site Interview', 'Final Interview', 'Offer', 'Rejected', 'Withdrawn'
    ];
  }
} 