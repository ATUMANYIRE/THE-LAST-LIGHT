import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const evidenceDir = path.join(process.cwd(), 'artifacts', 'release-audit');
fs.mkdirSync(evidenceDir, { recursive: true });

test('First-run onboarding and real keyboard/camera input', async ({ page }) => {
  const browserErrors: string[] = [];
  let stage = 'startup';
  page.on('pageerror', error => browserErrors.push(`${stage} pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') browserErrors.push(`${stage} console (${message.location().url}): ${message.text()}`);
  });

  await page.goto('/');
  stage = 'name entry';
  await expect(page.getByTestId('player-name-screen')).toBeVisible();
  const nameInput = page.getByRole('textbox', { name: 'Your name' });
  const nameButton = page.getByTestId('begin-journey-button');
  await expect(nameButton).toBeDisabled();
  await nameInput.fill('   ');
  await expect(nameButton).toBeDisabled();
  await nameInput.fill('Alex');
  await expect(nameButton).toBeEnabled();
  await page.screenshot({ path: path.join(evidenceDir, '40-first-run-name.png') });
  await nameButton.click();
  stage = 'gameplay loop';
  await expect(page.getByTestId('gameplay-loop-modal')).toContainText('Welcome, Alex');
  await page.getByTestId('loop-begin-button').click();
  await expect(page.getByTestId('title-screen')).toBeVisible();
  await page.getByTestId('enter-3d-world-button').click();
  stage = 'chapter introduction';
  await expect(page.getByTestId('intro-modal')).toContainText('Maya');
  await page.getByTestId('begin-chapter-button').click();
  await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeVisible();
  await page.screenshot({ path: path.join(evidenceDir, '41-first-run-tutorial.png') });
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeHidden();
  stage = 'explore movement';
  await expect(page.getByRole('button', { name: 'Switch to Design Mode' })).toBeVisible();
  await expect(page.getByTestId('reset-camera-button')).toBeVisible();
  const canvas = page.getByTestId('city-canvas-3d-container').locator('canvas');
  await expect(canvas).toBeVisible();
  await canvas.focus();
  stage = 'mode switching';
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Switch to Explore Mode' })).toBeVisible();
  await canvas.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Switch to Design Mode' })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
  await expect(page.getByRole('button', { name: 'Switch to Explore Mode' })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to Explore Mode' }).click();
  stage = 'explore movement';
  await page.screenshot({ path: path.join(evidenceDir, '42-explore-idle.png') });

  for (const [key, label] of [
    ['w', 'forward'], ['a', 'left'], ['s', 'back'], ['d', 'right'],
    ['ArrowUp', 'arrow-up'], ['ArrowLeft', 'arrow-left'],
    ['ArrowDown', 'arrow-down'], ['ArrowRight', 'arrow-right'],
  ] as const) {
    await page.keyboard.down(key);
    await page.waitForTimeout(500);
    await page.keyboard.up(key);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(evidenceDir, `43-move-${label}.png`) });
  }
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await page.waitForTimeout(600);
  await page.keyboard.up('w');
  await page.keyboard.up('Shift');
  await page.screenshot({ path: path.join(evidenceDir, '44-shift-jog.png') });
  await page.keyboard.down('w');
  await page.keyboard.down('d');
  await page.waitForTimeout(600);
  await page.keyboard.up('w');
  await page.keyboard.up('d');
  await page.screenshot({ path: path.join(evidenceDir, '45-diagonal.png') });

  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  const x = bounds!.x + bounds!.width * 0.45;
  const y = bounds!.y + bounds!.height * 0.45;
  await page.mouse.move(x, y);
  stage = 'camera interaction';
  await page.mouse.down();
  await page.mouse.move(x + 140, y, { steps: 8 });
  await page.mouse.up();
  await page.screenshot({ path: path.join(evidenceDir, '46-camera-rotated.png') });
  await page.getByTestId('reset-camera-button').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(evidenceDir, '47-camera-reset.png') });
  await page.getByTestId('reset-button').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(evidenceDir, '47b-player-after-reset.png') });

  stage = 'reload';
  await page.reload();
  await expect(page.getByTestId('player-name-screen')).toHaveCount(0);
  await expect(page.getByTestId('title-screen')).toBeVisible();
  await page.screenshot({ path: path.join(evidenceDir, '48-returning-player.png') });

  fs.writeFileSync(path.join(evidenceDir, 'browser-errors.json'), JSON.stringify(browserErrors, null, 2));
  expect(browserErrors.filter(error => /hydration|uncaught|webgl context lost/i.test(error))).toEqual([]);
});
