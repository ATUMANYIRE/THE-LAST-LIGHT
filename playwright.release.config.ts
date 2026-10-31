import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 90000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3005',
    screenshot: 'on',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 90000,
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1280, height: 800 } } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'], channel: 'chrome', viewport: { width: 393, height: 851 } } },
  ],
  // Start one production server separately and reuse it across smoke, soak, and recording.
});
