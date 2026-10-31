import { test, expect } from '@playwright/test';

test('Smoke test: opens home page', async ({ page, baseURL }) => {
  await page.goto('/?tllDiagnostics=1');
  await expect(page).toHaveTitle(/THE LAST LIGHT/i);
  await expect(page.getByTestId('player-name-screen')).toBeVisible();
  if (new URL(baseURL!).port === '3005') {
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => (window as typeof window & { __TLL_TEST_PLAYER__?: unknown }).__TLL_TEST_PLAYER__)).toBeUndefined();
  }
});
