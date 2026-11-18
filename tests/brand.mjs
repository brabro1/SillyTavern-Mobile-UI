// Renders docs/brand/banner.html to banner.png (README and Reddit, 2560x1280)
// and social-preview.jpg (GitHub's link preview, 1280x640, under 1 MB).
//   node brand.mjs
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';

const html = fileURLToPath(new URL('../docs/brand/banner.html', import.meta.url));
const out = name => fileURLToPath(new URL(`../docs/brand/${name}`, import.meta.url));
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || undefined });
for (const [scale, file, type] of [[2, 'banner.png', 'png'], [1, 'social-preview.jpg', 'jpeg']]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: scale });
    await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: out(file), type, ...(type === 'jpeg' ? { quality: 88 } : {}) });
    await page.close();
    console.log(`  ✓ ${file}`);
}
await browser.close();
