import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const outputDir = path.resolve('artifacts/release-audit');
fs.mkdirSync(outputDir, { recursive: true });
const durationMs = Number(process.env.TLL_SOAK_MS || 600000);
const label = process.env.TLL_SOAK_LABEL || '';
const reportFile = path.join(outputDir, `performance-soak${label ? `-${label}` : ''}.json`);
const errorFile = path.join(outputDir, `performance-soak${label ? `-${label}` : ''}-error.json`);
const measureRetained = process.env.TLL_SOAK_GC === '1';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
const cdp = await context.newCDPSession(page);
await cdp.send('Performance.enable');
const heap = async () => {
  const { metrics } = await cdp.send('Performance.getMetrics');
  const value = metrics.find(item => item.name === 'JSHeapUsedSize')?.value;
  return value === undefined ? null : Math.round(value);
};
const samples = [];
let actionError = null;
const startedAt = new Date().toISOString();
try {
  await page.addInitScript(() => {
    localStorage.setItem('tll_player_name', 'Soak Tester');
    localStorage.setItem('tll_loop_seen', '1');
    localStorage.setItem('tll_tutorial_done', '1');
  });
  await page.goto('http://localhost:3005/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.getByTestId('enter-3d-world-button').click();
  await page.getByTestId('begin-chapter-button').click();
  await page.getByRole('button', { name: 'Switch to Design Mode' }).waitFor();
  await page.evaluate(() => {
    window.__tllPerf = { frames: [], last: 0 };
    const tick = time => {
      if (window.__tllPerf?.last) window.__tllPerf.frames.push(time - window.__tllPerf.last);
      if (!window.__tllPerf) return;
      window.__tllPerf.last = time;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  if (measureRetained) await cdp.send('HeapProfiler.collectGarbage');
  const retainedHeapStartBytes = measureRetained ? await heap() : null;
  const started = Date.now();
  let cycles = 0;
  while (Date.now() - started < durationMs) {
    await page.keyboard.down('w');
    await page.waitForTimeout(1000);
    await page.keyboard.up('w');
    await page.keyboard.down('s');
    await page.waitForTimeout(1000);
    await page.keyboard.up('s');
    const canvas = page.getByTestId('city-canvas-3d-container').locator('canvas');
    const box = await canvas.boundingBox();
    if (box) {
      const x = box.x + box.width / 2, y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 90, y, { steps: 5 });
      await page.mouse.up();
    }
    await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
    await page.getByTestId('view-mode-button').click();
    await page.getByTestId('tool-paved_walkway').click();
    await page.getByTestId('tile-2-1').click();
    await page.getByTestId('run-simulation-button').click();
    await page.getByTestId('failure-modal').waitFor({ timeout: 12000 });
    await page.getByTestId('failure-retry-button').click();
    await page.getByTestId('reset-button').click();
    await page.getByTestId('view-mode-button').click();
    await page.getByRole('button', { name: 'Switch to Explore Mode' }).click();
    cycles++;
    if (cycles === 1 || cycles % 5 === 0) {
      samples.push({ elapsedMs: Date.now() - started, jsHeapUsedBytes: await heap() });
    }
  }
  await page.screenshot({ path: path.join(outputDir, 'performance-soak-end.png') });
  const frames = await page.evaluate(() => {
    const values = window.__tllPerf?.frames ?? [];
    delete window.__tllPerf;
    return values;
  });
  frames.sort((a, b) => a - b);
  if (measureRetained) await cdp.send('HeapProfiler.collectGarbage');
  const retainedHeapEndBytes = measureRetained ? await heap() : null;
  const pct = p => frames.length ? Number(frames[Math.floor((frames.length - 1) * p)].toFixed(2)) : null;
  const report = {
    startedAt, endedAt: new Date().toISOString(), requestedDurationMs: durationMs,
    elapsedMs: Date.now() - started, cycles, browser: browser.version(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    viewport: { width: 1280, height: 720 },
    hardware: { platform: os.platform(), arch: os.arch(), logicalCpus: os.cpus().length, totalRamBytes: os.totalmem(), freeRamBytesAtEnd: os.freemem() },
    frameSamples: frames.length,
    frameTimeMs: { p50: pct(0.5), p95: pct(0.95), p99: pct(0.99) },
    approximateFpsFromP50: pct(0.5) ? Number((1000 / pct(0.5)).toFixed(1)) : null,
    longFramesOver50ms: frames.filter(ms => ms > 50).length,
    longFramesOver100ms: frames.filter(ms => ms > 100).length,
    jsHeapSamples: samples,
    retainedHeapStartBytes, retainedHeapEndBytes,
    errors,
    note: 'RAF frame times include browser scheduling stalls. CDP JSHeapUsedSize excludes GPU and total browser process memory.',
  };
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ elapsedMs: report.elapsedMs, cycles, frames: frames.length, frameTimeMs: report.frameTimeMs, errors: errors.length }, null, 2));
} catch (error) {
  actionError = String(error);
  fs.writeFileSync(errorFile, JSON.stringify({ startedAt, at: new Date().toISOString(), actionError, errors, samples }, null, 2));
  throw error;
} finally {
  await context.close();
  await browser.close();
}
