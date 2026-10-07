import { defineConfig, devices } from '@playwright/test'

/**
 * Runs the store in demo mode (no Firebase needed) and drives it end-to-end.
 * First time: `npx playwright install` to download browsers.
 * Run: `npm run test:e2e`  ·  Headed/watch: `npm run test:e2e:ui`
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'list',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
