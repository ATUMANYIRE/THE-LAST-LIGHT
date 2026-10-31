import { chromium } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const video = pathToFileURL(path.resolve('artifacts/submission/the-last-light-demo.mp4')).href;
  await page.goto(video);
  await page.waitForTimeout(2500);
  const result = await page.evaluate(() => {
    const player = document.querySelector('video');
    return {
      title: document.title,
      canPlayMp4v: document.createElement('video').canPlayType('video/mp4; codecs="mp4v.20.9"'),
      playerFound: Boolean(player),
      readyState: player?.readyState ?? null,
      videoWidth: player?.videoWidth ?? null,
      currentTime: player?.currentTime ?? null,
      errorCode: player?.error?.code ?? null,
    };
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.playerFound || !result.videoWidth || result.errorCode) process.exitCode = 1;
} finally {
  await browser.close();
}
