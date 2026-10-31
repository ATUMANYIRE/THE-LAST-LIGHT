import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('artifacts/submission');
fs.mkdirSync(out, { recursive: true });
const raw = path.join(out, 'raw');
fs.mkdirSync(raw, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const overlayContext = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const overlayPage = await overlayContext.newPage();
const renderOverlay = async (title, subtitle, filename) => {
  await overlayPage.setContent(`<style>html,body{margin:0;background:transparent;font-family:Segoe UI,Arial,sans-serif;color:#F6F3EB} .panel{position:absolute;bottom:0;left:0;right:0;height:190px;background:rgba(12,23,32,.86);display:flex;flex-direction:column;justify-content:center;padding:0 58px;box-sizing:border-box}h1{font-size:42px;font-weight:600;margin:0 0 9px}p{font-size:21px;color:#B7C8D5;margin:0}</style><div class="panel"><h1>${title}</h1><p>${subtitle}</p></div>`);
  await overlayPage.screenshot({ path: path.join(out, filename), omitBackground: true });
};
await renderOverlay('THE LAST LIGHT — The Invisible Resident', 'An inclusive city-design puzzle', 'opening-overlay.png');
await renderOverlay('Every neighbor deserves a way home.', '3 districts · 5 unique residents · 7 journeys', 'closing-overlay.png');
await overlayContext.close();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1,
  recordVideo: { dir: raw, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
const scenes = [];
let started = Date.now();
const scene = async (name, holdMs = 3500) => {
  scenes.push({ name, atMs: Date.now() - started, holdMs });
  console.log(`${Math.round((Date.now() - started) / 1000)}s ${name}`);
  await page.waitForTimeout(holdMs);
};
const click = async id => page.getByTestId(id).click();
const tile = async (x, y) => click(`tile-${x}-${y}`);
const tool = async id => click(`tool-${id}`);
const walk = async (key, ms) => { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); };
let view = '3d';
const designBoard = async () => {
  await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
  if (view === '3d') { await click('view-mode-button'); view = '2d'; }
  await page.getByRole('grid').waitFor();
};
const exploreCity = async () => {
  if (view === '2d') { await click('view-mode-button'); view = '3d'; }
  await page.getByRole('button', { name: 'Switch to Explore Mode' }).click();
  await page.getByTestId('city-canvas-3d-container').locator('canvas').waitFor();
};
const testRoute = async () => click('run-simulation-button');
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

try {
  await page.goto('http://localhost:3005/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await expect(page.getByTestId('player-name-screen')).toBeVisible();
  await scene('Welcome and name entry', 3500);
  await page.getByRole('textbox', { name: 'Your name' }).fill('Alex');
  await click('begin-journey-button');
  await scene('The accessibility challenge', 4500);
  await click('loop-begin-button');
  await expect(page.getByTestId('title-screen')).toBeVisible();
  await scene('The Last Light title', 4500);
  await click('enter-3d-world-button');
  await expect(page.getByTestId('intro-modal')).toBeVisible();
  await scene('Chapter 1: The Shortcut', 3500);
  await click('begin-chapter-button');
  await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeVisible();
  await scene('How to play', 3500);
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await scene('Maya and the Library in Explore Mode', 1800);
  await walk('w', 1800);
  await walk('d', 1000);
  await click('reset-camera-button');
  await page.screenshot({ path: path.join(out, 'demo-explore.png') });
  await scene('Explore the Clocktower Quarter', 2500);
  await designBoard();
  await scene('Design Mode: connect Maya to the Library', 2800);
  await tool('paved_walkway');
  await tile(2, 1); await tile(2, 2); await tile(5, 2);
  await scene('Paved shortcut and budget change', 3000);
  await testRoute();
  await page.getByTestId('reveal-modal').waitFor({ timeout: 15000 });
  await scene('Sam reveals the stair barrier', 5000);
  await click('acknowledge-reveal-button');
  await tool('ramp'); await tile(3, 2);
  await scene('A ramp makes the route accessible', 3000);
  await testRoute();
  await page.getByTestId('victory-modal').waitFor({ timeout: 15000 });
  await scene('Chapter 1 complete', 4500);
  await click('victory-continue-button');

  await page.getByTestId('intro-modal').waitFor();
  await scene('Chapter 2: The Silent Crossing', 3500);
  await click('begin-chapter-button');
  await exploreCity();
  await walk('w', 1400);
  await scene('Kai explores Neon Avenue', 3000);
  await designBoard();
  await scene('The crossing needs a route', 2200);
  await tool('paved_walkway');
  for (const [x, y] of [[2, 2], [3, 2], [5, 2], [6, 2]]) await tile(x, y);
  await scene('Kai’s route across the avenue', 2700);
  await testRoute();
  await page.getByTestId('reveal-modal').waitFor({ timeout: 15000 });
  await scene('Elena needs tactile and acoustic guidance', 4500);
  await click('acknowledge-reveal-button');
  await tool('tactile_paving');
  for (const [x, y] of [[2, 3], [3, 3], [5, 3], [6, 3]]) await tile(x, y);
  await tool('acoustic_beacon'); await tile(4, 3);
  await scene('Tactile paving and acoustic beacon', 3600);
  await testRoute();
  await page.getByTestId('victory-modal').waitFor({ timeout: 15000 });
  await scene('Chapter 2 complete', 4200);
  await click('victory-continue-button');

  await page.getByTestId('intro-modal').waitFor();
  await scene('Chapter 3: One Light Left', 3500);
  await click('begin-chapter-button');
  await exploreCity();
  await walk('w', 1500);
  await scene('The neighborhood after the blackout', 3500);
  await designBoard();
  await tool('streetlamp'); await tile(5, 3);
  await tool('ramp'); await tile(4, 3);
  await tool('paved_walkway');
  for (const [x, y] of [[3, 3], [6, 3], [7, 3]]) await tile(x, y);
  await scene('Lighting and an accessible corridor', 3500);
  await testRoute();
  await page.getByTestId('reveal-modal').waitFor({ timeout: 15000 });
  await scene('Mr Henderson needs places to rest', 4500);
  await click('acknowledge-reveal-button');
  await tool('resting_bench'); await tile(3, 3); await tile(6, 3);
  await scene('Resting benches complete the route', 3200);
  await testRoute();
  await page.getByTestId('victory-modal').waitFor({ timeout: 15000 });
  await scene('Chapter 3 complete', 4400);
  await click('victory-continue-button');
  const finale = page.getByTestId('finale-modal');
  await expect(finale).toContainText('3 / 3');
  await expect(finale).toContainText('5 / 5');
  await expect(finale).toContainText('7 / 7');
  await scene('Grand Finale: 3 districts, 5 residents, 7 journeys', 8500);
  await page.screenshot({ path: path.join(out, 'demo-finale.png') });
  if (errors.length) throw new Error(`Browser errors during recording: ${errors.join('; ')}`);
} finally {
  fs.writeFileSync(path.join(out, 'raw-scene-timings.json'), JSON.stringify({ scenes, errors, elapsedMs: Date.now() - started }, null, 2));
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(path.join(out, 'raw-gameplay.webm'));
  await browser.close();
}
