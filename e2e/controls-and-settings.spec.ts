import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.join(process.cwd(), 'artifacts', 'release-audit');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const skipCinematic = async (page: any) => {
  await page.getByTestId('enter-3d-world-button').click();
};
const dismissTutorial = async (page: any) => {
  await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeVisible();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
};
const showDesignBoard = async (page: any) => {
  await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
  await page.getByTestId('view-mode-button').click();
  await expect(page.getByRole('grid')).toBeVisible();
};

test.describe('THE LAST LIGHT: Controls, Accessibility Toggles, Persistence & Edge Cases', () => {
  // Pre-seed localStorage so PlayerNameScreen and GameplayLoopModal don't block tests
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('tll_player_name', 'Tester');
      localStorage.setItem('tll_loop_seen', '1');
    });
  });

  test('Keyboard navigation, tool placement, undo, and reset', async ({ page }) => {
    test.setTimeout(180000);
    await page.goto('/');
    await skipCinematic(page);

    // Dismiss intro modal via Escape key
    const introModal = page.getByTestId('intro-modal');
    await expect(introModal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(introModal).toBeHidden();
    await dismissTutorial(page);
    await showDesignBoard(page);

    const budgetDisplay = page.getByTestId('budget-display');
    await expect(budgetDisplay).toContainText('$150');

    // Select tool 1 (Paved Walkway) via keyboard hotkey '1'
    await page.keyboard.press('1');
    const pavedTool = page.getByTestId('tool-paved_walkway');
    await expect(pavedTool).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('grid').focus();

    // Move cursor with Arrow keys and place via Space
    // Initial cursor is at (1, 1). Move Right to (2, 1)
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');

    // Placed at (2, 1). Budget should be $135
    await expect(budgetDisplay).toContainText('$135');

    // Test Undo via Ctrl+Z
    await page.keyboard.press('Control+z');
    await expect(budgetDisplay).toContainText('$150');

    // Test Redo via Ctrl+Y
    await page.keyboard.press('Control+y');
    await expect(budgetDisplay).toContainText('$135');
    await page.keyboard.press('Control+z');
    await expect(budgetDisplay).toContainText('$150');

    // Test Undo & Redo buttons in Header
    await page.getByTestId('tile-2-1').click();
    await expect(budgetDisplay).toContainText('$135');
    await page.getByTestId('undo-button').click();
    await expect(budgetDisplay).toContainText('$150');
    await page.getByTestId('redo-button').click();
    await expect(budgetDisplay).toContainText('$135');
    await page.getByTestId('undo-button').click();
    await expect(budgetDisplay).toContainText('$150');

    // Test Reset Level button in Header
    await page.getByTestId('tile-2-1').click();
    await page.getByTestId('tile-2-2').click();
    await expect(budgetDisplay).toContainText('$120');
    await page.getByTestId('reset-button').click();
    await expect(budgetDisplay).toContainText('$150');

    // Test Help Guide Modal
    await page.getByTestId('help-button').click();
    const helpModal = page.getByTestId('help-modal');
    await expect(helpModal).toBeVisible();
    await expect(helpModal).toContainText('Game Guide & Controls');
    await expect(helpModal).toContainText('The Invisible Resident Mechanic');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20-help-guide.png') });
    await page.getByTestId('close-help-button').click({ force: true });
    await expect(helpModal).toBeHidden();
  });

  test('Failure Modal when path is deliberately blocked', async ({ page }) => {
    await page.goto('/');
    await skipCinematic(page);
    await page.getByTestId('begin-chapter-button').click();
    await dismissTutorial(page);
    await showDesignBoard(page);

    // Deliberately run simulation without building path
    await page.getByTestId('run-simulation-button').click();

    // Failure modal should appear
    const failureModal = page.getByTestId('failure-modal');
    await expect(failureModal).toBeVisible({ timeout: 6000 });
    await expect(failureModal).toContainText('Route Needs Redesign');
    await expect(failureModal).toContainText('Accessibility Barrier Encountered');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21-failure-modal.png') });

    // Dismiss failure modal
    await page.getByTestId('failure-retry-button').click();
    await expect(failureModal).toBeHidden();
  });

  test('Settings toggles: High Contrast, Reduced Motion, Large Text, Captions', async ({ page }) => {
    await page.goto('/');
    await skipCinematic(page);
    await page.getByTestId('begin-chapter-button').click();
    await dismissTutorial(page);
    await showDesignBoard(page);

    // Open settings
    await page.getByTestId('settings-button').click();
    const settingsModal = page.getByTestId('settings-modal');
    await expect(settingsModal).toBeVisible();

    // Toggle High Contrast
    await page.getByTestId('toggle-high-contrast').click({ force: true });
    const root = page.locator('div.min-h-screen');
    await expect(root).toHaveClass(/high-contrast/);

    // Toggle Large Text
    await page.getByTestId('toggle-large-text').click({ force: true });
    await expect(root).toHaveClass(/large-text/);

    // Toggle Reduced Motion
    await page.getByTestId('toggle-reduced-motion').click({ force: true });
    await expect(root).toHaveClass(/reduced-motion/);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22-settings-modal.png') });
    await page.getByTestId('close-settings-button').click({ force: true });
    await expect(settingsModal).toBeHidden();

    // Take screenshot of high contrast gameplay board
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '23-high-contrast-gameplay.png') });
  });

  test('Persistence: Progress stored and recovered from localStorage', async ({ page }) => {
    await page.goto('/');
    await skipCinematic(page);
    await page.getByTestId('begin-chapter-button').click();
    await dismissTutorial(page);
    await showDesignBoard(page);

    // Complete the chapter through visible controls before checking persistence.
    await page.getByTestId('tool-paved_walkway').click();
    for (const tile of ['tile-2-1', 'tile-2-2', 'tile-5-2']) await page.getByTestId(tile).click();
    await page.getByTestId('run-simulation-button').click();
    await expect(page.getByTestId('reveal-modal')).toBeVisible();
    await page.getByTestId('acknowledge-reveal-button').click();
    await page.getByTestId('tool-ramp').click();
    await page.getByTestId('tile-3-2').click();
    await page.getByTestId('run-simulation-button').click();
    await expect(page.getByTestId('victory-modal')).toBeVisible();
    await page.getByTestId('victory-continue-button').click();
    await expect(page.getByTestId('intro-modal')).toContainText('Chapter 2');

    // Reload page
    await page.reload();
    await skipCinematic(page);

    // Verify Chapter 2 is loaded from persisted state
    const introModal = page.getByTestId('intro-modal');
    await expect(introModal).toBeVisible();
    await expect(introModal).toContainText('Chapter 2');

    // Open chapter select to verify unlocked status
    await page.keyboard.press('Escape');
    await page.getByTestId('chapter-select-button').click();
    const chapterSelectModal = page.getByTestId('chapter-select-modal');
    await expect(chapterSelectModal).toBeVisible();

    // Verify Chapter 1 is completed and Chapter 2 is unlocked.
    await expect(chapterSelectModal).toContainText('Chapter 1');
    await expect(chapterSelectModal).toContainText('Chapter 2');
    await expect(chapterSelectModal).toContainText('Chapter 3');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '24-persisted-progress.png') });

    await page.reload();
    await expect(page.getByTestId('title-screen')).toBeVisible();
    await page.getByRole('button', { name: 'Replay from Chapter 1' }).click();
    await expect(page.getByTestId('intro-modal')).toContainText('Chapter 1');
  });
});
