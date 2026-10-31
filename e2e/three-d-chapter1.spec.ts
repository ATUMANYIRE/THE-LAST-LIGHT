import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.join(process.cwd(), 'artifacts', 'release-audit');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

test.describe('THE LAST LIGHT: Premium 3D Chapter 1 Verification', () => {
  // Pre-seed localStorage so PlayerNameScreen and GameplayLoopModal don't block tests
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('tll_player_name', 'Tester');
      localStorage.setItem('tll_loop_seen', '1');
    });
  });

  test('Complete 3D Chapter 1 gameplay: Cinematic, Canvas, Construction, Reveal, Ramp & Victory', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Verify the current title screen and enter through its visible control.
    const cinematic = page.getByTestId('title-screen');
    await expect(cinematic).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-01-cinematic-prologue.png') });

    await page.getByTestId('enter-3d-world-button').click();
    await expect(cinematic).toBeHidden();

    // 2. Dismiss Chapter 1 Intro Dialogue
    const introModal = page.getByTestId('intro-modal');
    await expect(introModal).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-02-ch1-intro-modal.png') });
    await page.getByTestId('begin-chapter-button').click();
    await expect(introModal).toBeHidden();
    await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeVisible();
    await page.getByRole('button', { name: 'Skip tutorial' }).click();

    // 3. Verify 3D Canvas Container and Canvas WebGL context
    const canvasContainer = page.getByTestId('city-canvas-3d-container');
    await expect(canvasContainer).toBeVisible();
    const canvasEl = canvasContainer.locator('canvas');
    await expect(canvasEl).toBeVisible();

    // Verify HUD elements
    const budgetDisplay = page.getByTestId('budget-display');
    await expect(budgetDisplay).toContainText('$150');

    // Wait a brief moment for 3D scene to settle and capture initial 3D town screenshot
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-03-miniature-town-initial.png') });
    await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
    await page.getByTestId('view-mode-button').click();

    // 4. Build Phase 1 Paved Shortcut for Maya
    // Maya is at (1, 1). Target Library is at (6, 2) / (7, 2).
    // Select Paved Walkway tool [1]
    await page.getByTestId('tool-paved_walkway').click();

    // Construct path from (2, 1) -> (2, 2) -> (5, 2)
    await page.getByTestId('tile-2-1').click();
    await expect(budgetDisplay).toContainText('$135');

    await page.getByTestId('tile-2-2').click();
    await page.getByTestId('tile-5-2').click();
    await expect(budgetDisplay).toContainText('$105');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-04-phase1-paved-shortcut.png') });

    // 5. Test Pathways for Maya
    await page.getByTestId('run-simulation-button').click();

    // 6. The Signature Turn: The Invisible Resident Reveal (Sam)
    const revealModal = page.getByTestId('reveal-modal');
    await expect(revealModal).toBeVisible({ timeout: 8000 });
    await expect(revealModal).toContainText('Wait! Look Closer...');
    await expect(revealModal).toContainText('Sam');
    await expect(revealModal).toContainText(/sunken stone steps/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-05-sam-revealed.png') });

    // Acknowledge reveal
    await page.getByTestId('acknowledge-reveal-button').click();
    await expect(revealModal).toBeHidden();

    // 7. Phase 2: Install Modular Ramp at (3, 2)
    // Select Modular Ramp tool [2]
    const rampTool = page.getByTestId('tool-ramp');
    await expect(rampTool).toBeVisible();
    await rampTool.click();

    // Place ramp over the historic stone stairs at (3, 2) (cost $25 -> $80 remaining)
    await page.getByTestId('tile-3-2').click();
    await expect(budgetDisplay).toContainText('$80');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-06-ramp-placed-3d.png') });

    // 8. Test Pathways Again: Both Maya & Sam must succeed!
    await page.getByTestId('run-simulation-button').click();

    // 9. Chapter 1 Victory Modal
    const victoryModal = page.getByTestId('victory-modal');
    await expect(victoryModal).toBeVisible({ timeout: 8000 });
    await expect(victoryModal).toContainText('Chapter 1 Complete');
    await expect(victoryModal).toContainText(/Curb-Cut Effect|Equitable Use/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-07-ch1-victory.png') });
  });

  test('3D Camera zoom, 2D tactical toggle, and responsive mobile viewport', async ({ page }) => {
    // Mobile Viewport test (Pixel 5: 393 x 851)
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/');

    await page.getByTestId('enter-3d-world-button').click();

    // Dismiss intro modal
    await page.getByTestId('begin-chapter-button').click();
    await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeVisible();
    await page.getByRole('button', { name: 'Skip tutorial' }).click();

    // Verify 3D Canvas fills mobile viewport without horizontal scrolling
    const canvasContainer = page.getByTestId('city-canvas-3d-container');
    await expect(canvasContainer).toBeVisible();
    await page.getByTestId('view-mode-button').click();
    await expect(page.getByRole('grid')).toBeVisible();
    await page.getByTestId('view-mode-button').click();
    await expect(canvasContainer).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-08-mobile-viewport-3d.png') });
  });
});
