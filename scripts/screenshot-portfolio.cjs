const { chromium } = require('playwright');
const path = require('path');

const outDir = path.join(__dirname, '..', 'docs', 'screenshots');

const targets = [
  { theme: 'business', viewport: { width: 1440, height: 900 }, suffix: 'desktop' },
  { theme: 'business', viewport: { width: 390, height: 844 }, suffix: 'mobile' },
  { theme: 'matrix', viewport: { width: 1440, height: 900 }, suffix: 'desktop' },
  { theme: 'matrix', viewport: { width: 390, height: 844 }, suffix: 'mobile' },
];

(async () => {
  const browser = await chromium.launch();
  for (const t of targets) {
    const page = await browser.newPage({ viewport: t.viewport });
    await page.goto(`http://localhost:4321/t/${t.theme}/portfolio`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(7000);
    const file = path.join(outDir, `m6-portfolio-${t.theme}-${t.suffix}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('saved', file);
    await page.close();
  }
  await browser.close();
})();
