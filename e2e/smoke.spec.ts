import { test, expect } from '@playwright/test';

test('Smoke test: opens home page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/THE LAST LIGHT/i);
});
