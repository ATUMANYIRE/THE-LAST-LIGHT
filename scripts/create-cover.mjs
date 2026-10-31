// Compose a cover from a captured frame of the actual browser playthrough.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('artifacts/submission');
const image = path.join(out, 'demo-cover-source.png');
if (!fs.existsSync(image)) throw new Error('Record the real Explore scene before making the cover.');
const data = fs.readFileSync(image).toString('base64');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}html,body{margin:0;width:1280px;height:720px;font-family:Segoe UI,Arial,sans-serif;color:#f6f2e8}
    body{background-image:linear-gradient(90deg,rgba(8,19,25,.97) 0%,rgba(8,19,25,.86) 35%,rgba(8,19,25,.05) 78%),url('data:image/png;base64,${data}');background-size:100% 100%,115% auto;background-position:center,left center;background-repeat:no-repeat}
    main{position:absolute;inset:0;padding:72px 70px;display:flex;flex-direction:column;justify-content:space-between}
    .eyebrow{font-size:17px;font-weight:700;letter-spacing:.28em;color:#e8c180;text-transform:uppercase}
    .title{font-size:94px;line-height:.97;letter-spacing:-.05em;font-weight:800;max-width:680px;text-shadow:0 4px 20px #0a161c}
    .subtitle{font-size:31px;font-weight:400;color:#e8c180;margin-top:28px;letter-spacing:-.02em}
    .footer{font-size:19px;max-width:690px;line-height:1.4;color:#e8e7e1}
    .rule{width:72px;height:4px;background:#e8c180;margin-bottom:20px}
  </style></head><body><main><div class="eyebrow">An inclusive city design game</div><div><div class="title">THE<br>LAST LIGHT</div><div class="subtitle">The Invisible Resident</div></div><div><div class="rule"></div><div class="footer">Every neighbor deserves a way home.</div></div></main></body></html>`);
  await page.screenshot({ path: path.join(out, 'the-last-light-cover.png') });
  console.log(path.join(out, 'the-last-light-cover.png'));
} finally {
  await browser.close();
}
