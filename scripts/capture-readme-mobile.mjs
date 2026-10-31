import { chromium } from '@playwright/test';
import fs from 'node:fs';

fs.mkdirSync('docs/images', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 393, height: 851 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3005/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'Your name' }).fill('Alex');
  await page.getByTestId('begin-journey-button').click();
  await page.getByTestId('loop-begin-button').click();
  await page.getByTestId('enter-3d-world-button').click();
  await page.getByTestId('begin-chapter-button').click();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.getByTestId('touch-dpad').waitFor();
  await page.screenshot({ path: 'docs/images/mobile-controls.png' });
  console.log('docs/images/mobile-controls.png');
} finally {
  await browser.close();
}
