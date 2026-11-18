// Walks through every screen at three sizes (phone, small phone, sideways) and with
// the keyboard up; prints errors and anything wider than the screen, and saves a
// picture of each screen to look through. Test data only.
//   ST_URL=http://127.0.0.1:8000 CHROME_CHANNEL=chrome node audit.mjs results/audit
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const sizes = [
    { name: 'phone', width: 375, height: 812 },
    { name: 'small', width: 360, height: 640 },
    { name: 'land', width: 812, height: 375 },
];
const report = [];
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || undefined });
for (const size of sizes) {
    const context = await browser.newContext({ ...devices['Pixel 7'], viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const logs = [];
    page.on('pageerror', e => logs.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (['error', 'warning'].includes(m.type()) && /stmui|Pocket|index\.js/i.test(m.text() + (m.location()?.url ?? ''))) logs.push(`${m.type()}: ${m.text().slice(0, 160)}`); });
    const settle = ms => page.waitForTimeout(ms);
    const shot = async name => {
        await settle(700);
        await page.evaluate(() => document.getAnimations().forEach(a => { try { a.finish(); } catch {} }));
        const wide = await page.evaluate(() => {
            const vw = window.innerWidth;
            const out = [];
            for (const el of document.querySelectorAll('body *')) {
                const r = el.getBoundingClientRect();
                if (!r.width || !el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
                if (r.right > vw + 2 || r.left < -2) {
                    // Only report the outermost offender, and only things that are visible.
                    const cs = getComputedStyle(el);
                    if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
                    let p = el.parentElement, clipped = false;
                    while (p && p !== document.body) { const pc = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(pc.overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 2 && pr.left >= -2) { clipped = true; break; } } p = p.parentElement; }
                    if (!clipped) out.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className).split(' ').slice(0, 2).join('.')} [${Math.round(r.left)}..${Math.round(r.right)}]`);
                }
            }
            return out.slice(0, 6);
        });
        if (wide.length) report.push(`${size.name}/${name}: wider than screen: ${wide.join(' | ')}`);
        await page.screenshot({ path: `${OUT}/${size.name}-${name}.png` });
    };
    const tab = async id => { await page.evaluate(want => document.querySelector(`.stmui-tab[data-tab="${want}"]`)?.click(), id); await settle(900); };
    const close = async () => { await page.evaluate(() => document.querySelector('#stmui-sheet .stmui-done')?.click()); await settle(400); };
    await page.goto(process.env.ST_URL ?? 'http://127.0.0.1:8000', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.classList.contains('stmui-on'), null, { timeout: 120000 }).catch(() => {});
    await settle(3500);
    await close();
    if (!await page.evaluate(() => document.documentElement.classList.contains('stmui-on'))) { report.push(`${size.name}: Pocket Tavern not on`); await context.close(); continue; }
    await shot('welcome');
    await page.evaluate(async () => { const c = SillyTavern.getContext(); await c.selectCharacterById(String(c.characters.findIndex(x => x.name === 'Seraphina'))); });
    await settle(2500);
    await page.evaluate(() => document.getElementById('chat').scrollTo(0, 1e9));
    await shot('chat');
    await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="more"]').click()); await shot('more'); await close();
    await page.evaluate(() => document.querySelector('.stmui-ab-quick')?.click()); await shot('quick'); await close();
    await page.evaluate(() => document.querySelector('.stmui-ctx-ring')?.click()); await shot('context'); await close();
    await page.evaluate(() => document.querySelector('.stmui-persona-chip')?.click()); await shot('persona');
    await page.evaluate(() => document.querySelector('.stmui-persona-card-edit')?.click()); await shot('persona-edit'); await close();
    await page.evaluate(() => [...document.querySelectorAll('#chat .mes .extraMesButtonsHint')].pop()?.click()); await shot('mesmenu'); await close();
    await page.evaluate(() => [...document.querySelectorAll('#chat .mes .mes_edit')].pop()?.click()); await shot('editor');
    await page.evaluate(() => document.querySelector('#chat .mes:has(#curEditTextarea) .mes_edit_cancel')?.click()); await settle(500);
    // Keyboard up: the screen gets shorter while typing.
    await page.locator('#send_textarea').tap().catch(() => {});
    await page.setViewportSize({ width: size.width, height: Math.round(size.height * 0.55) });
    await settle(800);
    await page.locator('#send_textarea').fill('Testing a longer message that wraps onto a second and maybe a third line in the box.');
    await shot('keyboard');
    await page.locator('#send_textarea').fill('');
    await page.evaluate(() => document.activeElement?.blur());
    await page.setViewportSize({ width: size.width, height: size.height });
    await settle(600);
    for (const id of ['rightNavHolder', 'WI-SP-button', 'ai-config-button']) { await tab(id); await shot(`page-${id}`); }
    await page.evaluate(() => document.querySelector('#user-settings-button > .drawer-toggle')?.click()); await settle(900); await shot('page-settings');
    await page.evaluate(() => document.querySelector('#extensions-settings-button > .drawer-toggle')?.click()); await settle(900); await shot('page-extensions');
    await page.evaluate(() => document.querySelector('#rm_api_block')?.closest('.drawer')?.querySelector('.drawer-toggle')?.click()); await settle(900); await shot('page-api');
    await tab('chat');
    await page.evaluate(() => document.querySelector('.stmui-ab-home')?.click()); await settle(1500);
    await page.evaluate(() => document.querySelector('.stmui-group-toggle')?.click()); await shot('recent-open');
    await page.evaluate(() => document.getElementById('option_select_chat')?.click()); await shot('history');
    await page.goBack().catch(() => {}); await settle(600);
    if (logs.length) report.push(`${size.name}: console: ${[...new Set(logs)].join(' || ')}`);
    await context.close();
}
await browser.close();
console.log(report.length ? report.join('\n') : 'nothing found');
