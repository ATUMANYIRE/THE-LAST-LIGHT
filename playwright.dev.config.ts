import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 75000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3007',
    screenshot: 'on',
    video: 'off',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 90000,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  // No webServer — use existing dev server on port 3007
});
