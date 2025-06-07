import { defineConfig, devices } from '@playwright/test';

// Get environment variables with proper typing
const isCI = !!process.env.CI;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e-tests',
  /* Run tests in files in parallel */
  fullyParallel: !isCI, // Disable parallel execution on CI to prevent resource issues
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 1 : 0, // Reduce retries to prevent hanging
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined, // Use single worker on CI to prevent resource exhaustion
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'], // Shows test progress in CI
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: isCI ? 'retain-on-failure' : 'off',
    
    /* Take screenshot when test fails */
    screenshot: isCI ? 'only-on-failure' : 'off',
    
    /* Record video on failure */
    video: isCI ? 'retain-on-failure' : 'off',
    
    /* Timeout for each action */
    actionTimeout: isCI ? 5000 : 10000, // Reduce timeout on CI
    
    /* Timeout for navigation */
    navigationTimeout: isCI ? 15000 : 30000, // Reduce navigation timeout on CI
  },

  /* Configure projects for major browsers - reduced for CI */
  projects: isCI ? [
    // Only run Chromium on CI to prevent resource issues
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Add CI-specific settings
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        }
      },
    },
  ] : [
    // Full browser suite for local development
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Test configuration for different test types */
  timeout: isCI ? 30000 : 60000, // Reduce overall test timeout on CI

  /* Expect configuration */
  expect: {
    /* Timeout for expect() assertions */
    timeout: isCI ? 5000 : 10000, // Reduce expect timeout on CI
  },

  /* Global test setup */
  globalSetup: undefined, // Add if you need global setup
  globalTeardown: undefined, // Add if you need global teardown

  /* Run your local dev server before starting the tests - disabled in CI */
  webServer: isCI ? undefined : {
    command: 'npm run preview',
    port: 5173,
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  /* CI-specific configuration */
  ...(isCI && {
    maxFailures: 5, // Stop after 5 failures to prevent hanging
    forbidOnly: true,
    // Add global timeout for the entire test run
    globalTimeout: 15 * 60 * 1000, // 15 minutes max for entire test run
  }),
}); 