import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const evidenceDir = path.join(process.cwd(), 'artifacts', 'release-audit');
fs.mkdirSync(evidenceDir, { recursive: true });

test('Invalid placement, budget limit, skip, and reduced-motion route', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tll_player_name', 'Tester');
    localStorage.setItem('tll_loop_seen', '1');
  });
  await page.goto('/');
  await page.getByTestId('enter-3d-world-button').click();
  await page.getByTestId('begin-chapter-button').click();
  await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeVisible();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
  await page.getByTestId('view-mode-button').click();

  const budget = page.getByTestId('budget-display');
  await page.getByTestId('tile-0-0').click();
  await expect(page.getByTestId('placement-feedback')).toContainText('Cannot build on fixed building');
  await expect(budget).toContainText('$150');
  await page.screenshot({ path: path.join(evidenceDir, '50-invalid-placement.png') });

  for (const coordinate of ['2-1', '2-2', '2-3', '2-4', '2-5', '3-3', '3-5', '4-3', '4-5', '5-3']) {
    await page.getByTestId(`tile-${coordinate}`).click();
  }
  await expect(budget).toContainText('$0');
  await page.getByTestId('tile-5-4').click();
  await expect(page.getByTestId('placement-feedback')).toContainText('Insufficient budget');
  await expect(budget).toContainText('$0');
  await page.screenshot({ path: path.join(evidenceDir, '51-insufficient-budget.png') });

  await page.getByTestId('reset-button').click();
  await expect(budget).toContainText('$150');
  for (const coordinate of ['2-1', '2-2', '5-2']) await page.getByTestId(`tile-${coordinate}`).click();
  await page.getByTestId('view-mode-button').click();
  await page.getByTestId('run-simulation-button').click();
  const skip = page.getByRole('button', { name: 'Skip to simulation result' });
  await expect(skip).toBeVisible();
  await page.screenshot({ path: path.join(evidenceDir, '52-resident-route-animation.png') });
  await skip.click();
  await expect(page.getByTestId('reveal-modal')).toBeVisible();
  await page.getByTestId('acknowledge-reveal-button').click();

  await page.getByTestId('settings-button').click();
  await page.getByTestId('toggle-reduced-motion').click();
  await page.getByTestId('close-settings-button').click();
  await page.getByTestId('view-mode-button').click();
  await page.getByTestId('tool-ramp').click();
  await page.getByTestId('tile-3-2').click();
  await page.getByTestId('view-mode-button').click();
  await page.getByTestId('run-simulation-button').click();
  await expect(page.getByTestId('victory-modal')).toBeVisible();
  await expect(page.getByTestId('placement-feedback')).toHaveCount(0);
  await page.screenshot({ path: path.join(evidenceDir, '53-reduced-motion-victory.png') });
});
