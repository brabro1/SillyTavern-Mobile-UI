// iPhone and iPad sizes, and the way Safari handles the keyboard (the page keeps
// its height; the visible part shrinks and pans). Runs Chrome with iPhone and
// iPad settings, which turns on Pocket Tavern's iPhone handling, and fakes
// Safari's visible-area numbers to check that the bars, the chat and the message
// editor follow them. It is not Safari itself; a real iPhone is still the final word.
//   ST_URL=http://127.0.0.1:8000 CHROME_CHANNEL=chrome node ios.mjs
// ENGINE=webkit runs it in WebKit, Safari's engine (npx playwright install webkit).
import { chromium, webkit, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const ST_URL = process.env.ST_URL ?? 'http://127.0.0.1:8000';
const OUT = process.env.OUT ?? 'results/ios';
mkdirSync(OUT, { recursive: true });
const useWebkit = process.env.ENGINE === 'webkit';
const browser = useWebkit ? await webkit.launch() : await chromium.launch({ channel: process.env.CHROME_CHANNEL || undefined });
console.log(`iPhone and iPad checks in ${useWebkit ? "WebKit (Safari's engine)" : 'Chrome'}\n`);
let failed = 0;
const open = async (device, extra = {}) => {
    const context = await browser.newContext({ ...devices[device], ...extra });
    const page = await context.newPage();
    page.on('pageerror', e => console.log('   PAGEERROR', e.message));
    page.on('console', m => { if (m.type() === 'error' && /stmui|Pocket|Mobile-UI/i.test(m.text() + (m.location()?.url ?? ''))) console.log('   CONSOLE', m.text().slice(0, 160)); });
    await page.goto(ST_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.classList.contains('stmui-on'), null, { timeout: 90000 });
    await page.waitForTimeout(4500);
    await page.evaluate(() => document.querySelectorAll('dialog.popup[open] .popup-button-cancel').forEach(b => b.click()));
    await page.evaluate(() => document.querySelector('#stmui-sheet .stmui-done')?.click());
    await page.evaluate(async () => {
        const c = SillyTavern.getContext();
        const i = c.characters.findIndex(x => x.name === 'Seraphina');
        if (String(c.characterId) !== String(i)) await c.selectCharacterById(String(i));
    });
    await page.waitForTimeout(2000);
    return { context, page };
};
const check = async (name, fn) => {
    try { console.log(`  ✓ ${name}${(await fn()) ?? ''}`); } catch (e) { failed++; console.log(`  ✗ ${name}\n      ${e.message.split('\n')[0]}`); }
};
const fakeKeyboard = page => page.evaluate(async () => {
    // Safari: the page keeps its height; the visible part shrinks to 400px, panned 120px down.
    const vv = window.visualViewport;
    Object.defineProperty(vv, 'height', { configurable: true, get: () => 400 });
    Object.defineProperty(vv, 'offsetTop', { configurable: true, get: () => 120 });
    vv.dispatchEvent(new Event('resize'));
    await new Promise(r => setTimeout(r, 400));
});
const fakeKeyboardOff = page => page.evaluate(async () => {
    const vv = window.visualViewport;
    delete vv.height;
    delete vv.offsetTop;
    document.activeElement?.blur();
    vv.dispatchEvent(new Event('resize'));
    await new Promise(r => setTimeout(r, 400));
});
const layout = page => page.evaluate(() => {
    const r = sel => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), width: Math.round(b.width) }; };
    return { vh: innerHeight, vw: innerWidth, bar: r('#stmui-appbar'), sheld: r('#sheld'), form: r('#send_form'), tabs: r('.stmui-tabbar'), html: document.documentElement.className, transform: getComputedStyle(document.documentElement).transform };
});

for (const device of ['iPhone SE', 'iPhone 15', 'iPhone 15 Pro Max', 'iPhone 15 landscape']) {
    const { context, page } = await open(device);
    await check(`${device}: iPhone mode, bars at the edges, box on screen`, async () => {
        const l = await layout(page);
        if (!l.html.includes('stmui-ios')) throw new Error('not in iPhone mode');
        if (l.transform !== 'none') throw new Error(`transform ${l.transform}`);
        if (l.bar.top !== 0) throw new Error(`top bar at ${l.bar.top}`);
        if (l.form.bottom > l.vh || l.form.top < l.bar.bottom) throw new Error(`box ${JSON.stringify(l.form)} in ${l.vh}`);
        await page.screenshot({ path: `${OUT}/ios-${device.replace(/\s/g, '')}.png` });
        return `: ${l.vw}x${l.vh}, box ${l.form.top}-${l.form.bottom}`;
    });
    if (device === 'iPhone 15') {
        await check('iPhone 15: editing the last message, with the keyboard up the way Safari does it', async () => {
            await page.evaluate(() => [...document.querySelectorAll('#chat .mes')].pop().querySelector('.mes_edit').click());
            await page.waitForFunction(() => document.documentElement.classList.contains('stmui-editing'));
            await page.waitForTimeout(500);
            await page.locator('#curEditTextarea').focus();
            await fakeKeyboard(page);
            const s = await page.evaluate(() => {
                const r = sel => { const b = document.querySelector(sel).getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
                return { kb: document.documentElement.classList.contains('stmui-ios-kb'), bar: r('#stmui-appbar'), editor: r('#chat .mes:has(#curEditTextarea)'), box: r('#curEditTextarea'), save: r('#chat .mes:has(#curEditTextarea) .mes_edit_done') };
            });
            await page.screenshot({ path: `${OUT}/ios-editor-keyboard.png` });
            await fakeKeyboardOff(page);
            await page.evaluate(() => document.querySelector('#chat .mes:has(#curEditTextarea) .mes_edit_cancel')?.click());
            if (s.bar[0] !== 120) throw new Error(`top bar at ${s.bar[0]}, not at the visible top`);
            if (s.editor[0] !== s.bar[1] || s.editor[1] !== 520) throw new Error(`editor ${s.editor}, visible part 120-520`);
            if (s.save[1] > 520 || s.box[0] < s.bar[1]) throw new Error(`save ${s.save} box ${s.box}`);
            return `: bar ${s.bar}, editor ${s.editor}, Save ends at ${s.save[1]}`;
        });
        await check('iPhone 15: chat and message box follow the visible part', async () => {
            await page.locator('#send_textarea').focus();
            await fakeKeyboard(page);
            const s = await page.evaluate(() => {
                const r = sel => { const b = document.querySelector(sel).getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
                return { kb: document.documentElement.className.match(/stmui-(ios-kb|keyboard)/g), sheld: r('#sheld'), form: r('#send_form'), tabs: getComputedStyle(document.querySelector('.stmui-tabbar')).display };
            });
            await page.screenshot({ path: `${OUT}/ios-keyboard.png` });
            await fakeKeyboardOff(page);
            const after = await page.evaluate(() => [document.documentElement.classList.contains('stmui-ios-kb'), Math.round(document.getElementById('sheld').getBoundingClientRect().bottom)]);
            if (after[0]) throw new Error('still in keyboard mode after the keyboard closed');
            if (s.sheld[1] !== 520 || s.form[1] > 520 || s.tabs !== 'none') throw new Error(JSON.stringify(s));
            return `: chat ${s.sheld}, box ends ${s.form[1]}`;
        });
    }
    await context.close();
}

for (const device of ['iPad Pro 11 landscape', 'iPad Pro 11', 'iPad Mini landscape']) {
    const { context, page } = await open(device);
    await check(`${device}: layout and chat width`, async () => {
        const l = await layout(page);
        const col = await page.evaluate(() => Math.round(document.getElementById('sheld').getBoundingClientRect().width));
        const wide = l.html.includes('stmui-wide');
        await page.screenshot({ path: `${OUT}/ios-${device.replace(/\s/g, '')}.png` });
        if (wide && col < 700) throw new Error(`chat column only ${col}px`);
        return `: ${l.vw}x${l.vh}, ${wide ? 'desktop layout' : 'phone layout'}, chat ${col}px`;
    });
    if (device === 'iPad Pro 11 landscape') {
        await check('iPad landscape: Chat width slider in Themes changes the chat', async () => {
            await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="more"]').click());
            await page.waitForTimeout(600);
            await page.locator('#stmui-sheet .stmui-menu-row-theme').click();
            await page.waitForTimeout(600);
            const before = await page.evaluate(() => Math.round(document.getElementById('sheld').getBoundingClientRect().width));
            const s = await page.evaluate(async () => {
                const range = document.querySelector('#stmui-sheet .stmui-width-range');
                if (!range) return null;
                const was = range.value;
                range.value = '90';
                range.dispatchEvent(new Event('input', { bubbles: true }));
                await new Promise(r => setTimeout(r, 400));
                const after = Math.round(document.getElementById('sheld').getBoundingClientRect().width);
                const tall = range.getBoundingClientRect().height;
                range.value = was;
                range.dispatchEvent(new Event('input', { bubbles: true }));
                await new Promise(r => setTimeout(r, 400));
                return { after, tall, was, st: document.getElementById('chat_width_slider').value };
            });
            await page.screenshot({ path: `${OUT}/ios-ipad-width.png` });
            if (!s) throw new Error('no slider');
            if (s.after <= before || s.tall < 44) throw new Error(JSON.stringify({ before, ...s }));
            return `: ${before}px → ${s.after}px at 90%, back to ${s.was}%`;
        });
    }
    await context.close();
}

await browser.close();
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
