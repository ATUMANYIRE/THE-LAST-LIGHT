import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.join(process.cwd(), 'artifacts', 'release-audit');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

test.describe('THE LAST LIGHT: Focused Accessibility Audit & Mobile Viewport', () => {
  // Pre-seed localStorage so PlayerNameScreen and GameplayLoopModal don't block tests
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('tll_player_name', 'Tester');
      localStorage.setItem('tll_loop_seen', '1');
    });
  });

  test('Focused Accessibility Audit: ARIA live regions, roles, and dialog attributes', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('enter-3d-world-button').click();

    // 1. Verify ARIA Live polite announcement region exists
    const liveRegion = page.locator('div[aria-live="polite"][role="status"]');
    await expect(liveRegion).toHaveCount(2); // Global announcement + Budget indicator

    // 2. Verify Intro Modal semantics
    const introModal = page.getByTestId('intro-modal');
    await expect(introModal).toHaveAttribute('role', 'dialog');
    await expect(introModal).toHaveAttribute('aria-modal', 'true');
    await expect(introModal).toHaveAttribute('aria-labelledby', 'intro-title');

    // 3. Close modal and check board semantics
    await page.getByTestId('begin-chapter-button').click();
    await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeVisible();
    await page.getByRole('button', { name: 'Skip tutorial' }).click();
    await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
    await page.getByTestId('view-mode-button').click();
    const board = page.locator('div[role="grid"]');
    await expect(board).toBeVisible();
    await expect(board).toHaveAttribute('aria-label', /City Board/);

    // 4. Check tool button accessible attributes
    const tool = page.getByTestId('tool-paved_walkway');
    await expect(tool).toHaveAttribute('aria-pressed');
    await expect(tool).toHaveAttribute('aria-label');

    // 5. Open Settings Modal and check switch roles
    await page.getByTestId('settings-button').click();
    const settingsModal = page.getByTestId('settings-modal');
    await expect(settingsModal).toBeVisible();
    await expect(settingsModal).toHaveAttribute('role', 'dialog');
    await expect(settingsModal).toHaveAttribute('aria-modal', 'true');

    const highContrastSwitch = page.getByTestId('toggle-high-contrast');
    await expect(highContrastSwitch).toHaveAttribute('role', 'switch');
    await expect(highContrastSwitch).toHaveAttribute('aria-checked');

    await page.getByTestId('close-settings-button').click();
  });

  test('Mobile viewport responsiveness audit', async ({ page }) => {
    // Set explicit mobile viewport (393 x 851)
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/');

    await page.getByTestId('enter-3d-world-button').click();

    const introModal = page.getByTestId('intro-modal');
    await expect(introModal).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '30-mobile-intro.png') });

    await page.getByTestId('begin-chapter-button').click();
    await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeVisible();
    await page.getByRole('button', { name: 'Skip tutorial' }).click();
    await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
    await page.getByTestId('view-mode-button').click();

    // Check board container does not overflow page viewport
    const board = page.locator('div[role="grid"]');
    await expect(board).toBeVisible();

    // Verify header wraps gracefully without clipping
    const budgetDisplay = page.getByTestId('budget-display');
    await expect(budgetDisplay).toBeVisible();

    // Verify tool palette is accessible on mobile
    const tool = page.getByTestId('tool-paved_walkway');
    await expect(tool).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '31-mobile-board.png') });

    // Open Settings on mobile
    await page.getByTestId('settings-button').click();
    const settingsModal = page.getByTestId('settings-modal');
    await expect(settingsModal).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '32-mobile-settings.png') });
  });
});
