// Walks through Pocket Tavern together with other extensions people use with it:
// every Guided Generations action, menu and popup, and Input History. Needs a
// running SillyTavern (test data only) with both installed, for example in
// data/default-user/extensions. Requests to the AI are blocked, so nothing is
// generated. Screenshots of failures and popups go to results/compat.
//   ST_URL=http://127.0.0.1:8000 CHROME_CHANNEL=chrome node compat.mjs
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const ST_URL = process.env.ST_URL ?? 'http://127.0.0.1:8000';
const OUT = process.env.OUT ?? 'results/compat';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || undefined });
const context = await browser.newContext({ ...devices['Pixel 7'], viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
// Nothing may reach an AI service.
await context.route('**/*', route => {
    const req = route.request();
    if (req.method() === 'POST' && /generate|horde|completion|backends/i.test(req.url())) return route.abort();
    return route.continue();
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('popup', p => { console.log('    (popup window opened:', p.url(), ')'); p.close(); });
page.on('dialog', d => { console.log('    (dialog:', d.message().slice(0, 60), ')'); d.dismiss(); });
await page.goto(ST_URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.documentElement.classList.contains('stmui-on'), null, { timeout: 90000 });
await page.waitForTimeout(5000);
await page.evaluate(() => document.querySelectorAll('dialog.popup[open] .popup-button-cancel').forEach(b => b.click()));
await page.evaluate(() => document.querySelector('#stmui-sheet .stmui-done')?.click());
await page.evaluate(async () => {
    const c = SillyTavern.getContext();
    const i = c.characters.findIndex(x => x.name === 'Seraphina');
    if (String(c.characterId) !== String(i)) await c.selectCharacterById(String(i));
    window.open = url => { window.__opened = url; return null; };
});
await page.waitForTimeout(2500);
if (!(await page.evaluate(() => !!document.getElementById('gg-action-button-container') && !!document.querySelector('.stih--buttons')))) {
    console.log('Install Guided Generations and Input History in this SillyTavern first.');
    await browser.close();
    process.exit(1);
}

let failed = 0;
const check = async (name, fn) => {
    try {
        const note = await fn();
        console.log(`  ✓ ${name}${note ? `: ${note}` : ''}`);
    } catch (error) {
        failed++;
        console.log(`  ✗ ${name}\n      ${String(error.message).split('\n')[0]}`);
        await page.screenshot({ path: `${OUT}/ggfail-${name.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}.png` });
    }
};
const sheetOpen = () => page.waitForFunction(() => document.querySelector('#stmui-sheet.stmui-sheet-open, #stmui-sheet[open]'), null, { timeout: 4000 });
const sheetGone = () => page.waitForFunction(() => !document.getElementById('stmui-sheet'), null, { timeout: 4000 });
const closeSheet = async () => { await page.evaluate(() => document.querySelector('#stmui-sheet .stmui-done')?.click()); await sheetGone(); };
const openGuide = async () => { await page.locator('.stmui-gg-btn').click(); await sheetOpen(); await page.waitForTimeout(250); };
const rowByText = text => page.locator('#stmui-sheet .stmui-menu-row', { hasText: text }).first();
// Records presses on Guided Generations' own buttons, and (when `block`) stops its action.
const recorder = block => page.evaluate(blockIt => {
    window.__pressed = [];
    document.querySelectorAll('#gg-action-button-container .gg-action-button, #gg-action-button-container .gg-menu-button').forEach(button => {
        if (button.__rec) button.removeEventListener('click', button.__rec, true);
        button.__rec = event => {
            window.__pressed.push(button.id);
            if (blockIt) event.stopImmediatePropagation();
        };
        button.addEventListener('click', button.__rec, true);
    });
}, block);
const closePopups = () => page.evaluate(async () => {
    for (let i = 0; i < 4; i++) {
        const popup = [...document.querySelectorAll('dialog.popup[open]')].pop();
        if (!popup) return;
        (popup.querySelector('.popup-button-cancel:not(.displayNone)') ?? popup.querySelector('.popup-button-close') ?? popup.querySelector('.popup-button-ok'))?.click();
        await new Promise(r => setTimeout(r, 500));
    }
});

console.log('Guided Generations in Pocket Tavern\n');

await check('patch is on only because GG is installed', async () => {
    const s = await page.evaluate(() => ({
        on: document.documentElement.classList.contains('stmui-gg'),
        row: getComputedStyle(document.getElementById('gg-regular-buttons-container')).display,
        menus: getComputedStyle(document.getElementById('gg-menu-buttons-container')).display,
        btn: (() => { const b = document.querySelector('.stmui-gg-btn').getBoundingClientRect(); return [b.width, b.height]; })(),
        nextToSend: document.querySelector('.stmui-gg-btn').nextElementSibling?.id,
        label: document.querySelector('.stmui-gg-btn').getAttribute('aria-label'),
    }));
    if (!s.on || s.row !== 'none' || s.menus !== 'none') throw new Error(JSON.stringify(s));
    if (s.btn[0] < 44 || s.btn[1] < 44) throw new Error(`button ${s.btn}`);
    if (s.nextToSend !== 'send_but') throw new Error(`next to ${s.nextToSend}`);
    return `button ${s.btn.join('x')} beside Send, label "${s.label}"`;
});

await check('sheet lists the actions GG shows, with names and notes', async () => {
    await openGuide();
    const text = await page.evaluate(() => document.getElementById('stmui-sheet').innerText);
    await closeSheet();
    for (const want of ['Guided response', 'Guided swipe', 'Write my message as "I"', 'Persistent guides', 'Tools', 'Guided Generations settings', 'No instruction yet']) {
        if (!text.includes(want)) throw new Error(`missing ${want}`);
    }
});

await check('each action row presses the matching GG button (and the sheet closes)', async () => {
    await recorder(true);
    const pressed = [];
    for (const [label, id] of [['Guided response', 'gg_response_button'], ['Guided swipe', 'gg_swipe_button'], ['Write my message as "I"', 'gg_impersonate_button']]) {
        await openGuide();
        await rowByText(label).click();
        await sheetGone();
        const got = await page.evaluate(() => window.__pressed.at(-1));
        if (got !== id) throw new Error(`${label} pressed ${got}`);
        pressed.push(id);
    }
    return pressed.join(', ');
});

await check('typed instruction shows in the sheet, tapping it goes back to the box', async () => {
    await page.locator('#send_textarea').fill('Have her mention the old letter');
    await openGuide();
    const card = await page.locator('.stmui-gg-instruction').innerText();
    if (!card.includes('Have her mention the old letter')) throw new Error(card);
    await page.locator('.stmui-gg-instruction').click();
    await sheetGone();
    const focused = await page.evaluate(() => document.activeElement?.id);
    if (focused !== 'send_textarea') throw new Error(`focus on ${focused}`);
    await page.evaluate(() => document.activeElement.blur());
});

await check('hold the guide button runs the last action again', async () => {
    await recorder(true);
    await page.evaluate(() => { window.__pressed = []; });
    const box = await page.locator('.stmui-gg-btn').boundingBox();
    await page.mouse.move(box.x + 22, box.y + 22);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();
    await page.waitForTimeout(300);
    const s = await page.evaluate(() => ({ pressed: window.__pressed, sheet: !!document.getElementById('stmui-sheet') }));
    if (s.pressed.at(-1) !== 'gg_impersonate_button' || s.sheet) throw new Error(JSON.stringify(s));
    return 'repeated "Write my message as I", no sheet';
});

await check('guide count shows on the button', async () => {
    const s = await page.evaluate(async () => {
        const span = document.getElementById('pg_guide_counter_span');
        span.textContent = ' 2';
        await new Promise(r => setTimeout(r, 200));
        const badge = document.querySelector('.stmui-gg-count');
        const shown = { text: badge.textContent, hidden: badge.hidden, label: document.querySelector('.stmui-gg-btn').getAttribute('aria-label') };
        span.textContent = ' 0';
        await new Promise(r => setTimeout(r, 200));
        return { ...shown, after: badge.hidden };
    });
    if (s.text !== '2' || s.hidden || !s.after) throw new Error(JSON.stringify(s));
    return s.label;
});

await check('Persistent guides sub-sheet has every GG guide item', async () => {
    await openGuide();
    await rowByText('Persistent guides').click();
    await page.waitForFunction(() => document.querySelector('#stmui-sheet')?.innerText.includes('Situational'));
    const s = await page.evaluate(() => ({
        rows: [...document.querySelectorAll('#stmui-sheet .stmui-menu-row')].map(r => r.querySelector('.stmui-row-text > span')?.textContent),
        gg: [...document.querySelectorAll('#pg_tools_menu > a')].map(a => a.textContent.trim()),
        notes: [...document.querySelectorAll('#stmui-sheet .stmui-menu-row small')].filter(n => n.textContent.length > 10).length,
        tall: [...document.querySelectorAll('#stmui-sheet .stmui-menu-row')].every(r => r.getBoundingClientRect().height >= 44),
    }));
    await closeSheet();
    if (s.rows.join('|') !== s.gg.join('|')) throw new Error(`${s.rows} vs ${s.gg}`);
    if (!s.tall) throw new Error('a row is under 44px');
    return `${s.rows.length} items, ${s.notes} with descriptions`;
});

const shownGuidedPopup = () => page.evaluate(() => {
    const popup = [...document.querySelectorAll('body > .gg-popup')].find(p => p.style.display !== 'none' && getComputedStyle(p).display !== 'none');
    if (!popup) return null;
    const c = popup.querySelector('.gg-popup-content').getBoundingClientRect();
    const close = popup.querySelector('.gg-popup-close')?.getBoundingClientRect();
    return { id: popup.id, top: Math.round(c.top), bottom: Math.round(c.bottom), h: innerHeight, close: close ? Math.round(Math.min(close.width, close.height)) : 0, z: getComputedStyle(popup).zIndex };
});
const openPgItem = async item => {
    await openGuide();
    await rowByText('Persistent guides').click();
    await page.waitForFunction(() => document.querySelector('#stmui-sheet')?.innerText.includes('Situational'));
    await rowByText(item).click();
    await sheetGone();
};

await check('Persistent guides → Show Guides opens its popup', async () => {
    await openPgItem('Show Guides');
    await page.waitForFunction(() => document.querySelector('dialog.popup[open]'), null, { timeout: 6000 });
    const hash = await page.evaluate(() => location.hash);
    await page.screenshot({ path: `${OUT}/ggpopup-ShowGuides.png` });
    await closePopups();
    if (hash) throw new Error(`page address changed to ${hash}`);
});

await check('Persistent guides → Edit Guides says when there are none', async () => {
    await openPgItem('Edit Guides');
    await page.waitForFunction(() => document.querySelector('#toast-container .toast') || [...document.querySelectorAll('body > .gg-popup')].some(p => p.style.display !== 'none'), null, { timeout: 6000 });
    const text = await page.evaluate(() => document.querySelector('#toast-container .toast')?.textContent.trim());
    await page.evaluate(() => document.querySelectorAll('#toast-container .toast').forEach(t => t.remove()));
    return text ? `notice: "${text}"` : 'popup';
});

for (const item of ['Stat Tracker', 'Fun']) {
    await check(`Persistent guides → ${item}: a bottom sheet above the bars, back closes it`, async () => {
        await openPgItem(item);
        await page.waitForFunction(() => [...document.querySelectorAll('body > .gg-popup')].some(p => p.style.display !== 'none' && getComputedStyle(p).display !== 'none'), null, { timeout: 6000 });
        await page.waitForTimeout(700);
        const s = await shownGuidedPopup();
        await page.screenshot({ path: `${OUT}/ggpopup-${item.replace(/\s/g, '')}.png` });
        await page.goBack();
        await page.waitForTimeout(700);
        const after = await shownGuidedPopup();
        if (after) { await page.evaluate(() => document.querySelectorAll('body > .gg-popup').forEach(p => { p.style.display = 'none'; })); throw new Error('back did not close it'); }
        if (s.bottom > s.h + 1 || s.top < 0 || s.close < 44) throw new Error(JSON.stringify(s));
        return JSON.stringify(s);
    });
}

await check('Tools sub-sheet matches GG tools menu; Clear Input clears the box', async () => {
    await page.locator('#send_textarea').fill('to be cleared');
    await openGuide();
    await rowByText('Tools').click();
    await page.waitForFunction(() => document.querySelector('#stmui-sheet')?.innerText.includes('Spellchecker'));
    const s = await page.evaluate(() => ({
        rows: [...document.querySelectorAll('#stmui-sheet .stmui-menu-row')].map(r => r.querySelector('.stmui-row-text > span')?.textContent),
        gg: [...document.querySelectorAll('#gg_tools_menu > a')].map(a => a.textContent.trim()),
        groups: document.querySelectorAll('#stmui-sheet .stmui-menu-list').length,
    }));
    if (s.rows.join('|') !== s.gg.join('|')) throw new Error(`${s.rows} vs ${s.gg}`);
    await rowByText('Clear Input').click();
    await sheetGone();
    await page.waitForTimeout(800);
    await closePopups();
    const value = await page.evaluate(() => document.getElementById('send_textarea').value);
    if (value) throw new Error(`box still has "${value}"`);
    return `${s.rows.length} items in ${s.groups} groups`;
});

await check('Tools → Help opens the wiki, page address unchanged', async () => {
    await openGuide();
    await rowByText('Tools').click();
    await page.waitForFunction(() => document.querySelector('#stmui-sheet')?.innerText.includes('Help'));
    await rowByText('Help').click();
    await sheetGone();
    const s = await page.evaluate(() => ({ opened: window.__opened, hash: location.hash }));
    if (!String(s.opened).includes('GuidedGenerations') || s.hash) throw new Error(JSON.stringify(s));
});

await check('Tools → Edit Intros: bottom sheet, sub-choices visible, back closes it', async () => {
    await openGuide();
    await rowByText('Tools').click();
    await page.waitForFunction(() => document.querySelector('#stmui-sheet')?.innerText.includes('Edit Intros'));
    await rowByText('Edit Intros').click();
    await sheetGone();
    await page.waitForFunction(() => [...document.querySelectorAll('body > .gg-popup')].some(p => p.style.display !== 'none' && getComputedStyle(p).display !== 'none'), null, { timeout: 6000 });
    await page.waitForTimeout(700);
    const s = await shownGuidedPopup();
    const subs = await page.evaluate(() => [...document.querySelectorAll('body > .gg-popup .gg-suboption')].filter(el => el.getBoundingClientRect().height >= 44).length);
    await page.screenshot({ path: `${OUT}/ggpopup-EditIntros.png` });
    await page.goBack();
    await page.waitForTimeout(700);
    if (await shownGuidedPopup()) throw new Error('back did not close it');
    if (s.bottom > s.h + 1 || s.close < 44) throw new Error(JSON.stringify(s));
    return `${subs} sub-choices shown as 44px chips`;
});

await check('a real Guided Swipe runs without breaking the screen (AI blocked)', async () => {
    await recorder(false);
    await page.locator('#send_textarea').fill('Make it shorter');
    await openGuide();
    await rowByText('Guided swipe').click();
    await sheetGone();
    await page.waitForTimeout(3000);
    await closePopups();
    const s = await page.evaluate(() => ({ scrolled: window.scrollY, bar: document.getElementById('stmui-appbar').getBoundingClientRect().top, box: document.getElementById('send_textarea').value }));
    if (s.scrolled || s.bar < 0) throw new Error(JSON.stringify(s));
    return `box after: "${s.box}"`;
});

await check('back gesture closes the guide sheet', async () => {
    await openGuide();
    await page.waitForTimeout(400);
    await page.goBack();
    await sheetGone();
});

await check('Guided Generations settings row opens its settings', async () => {
    await openGuide();
    await rowByText('Guided Generations settings').click();
    await page.waitForFunction(() => document.documentElement.dataset.stmuiPage === 'extensions-settings-button');
    await page.waitForTimeout(900);
    const s = await page.evaluate(() => {
        const drawer = document.getElementById('gg_versionBadge')?.closest('.inline-drawer');
        const content = drawer?.querySelector('.inline-drawer-content');
        const r = drawer?.getBoundingClientRect();
        return { open: content && getComputedStyle(content).display !== 'none', top: r && Math.round(r.top) };
    });
    await page.screenshot({ path: `${OUT}/gg-settings.png` });
    await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="chat"]').click());
    await page.waitForFunction(() => !document.documentElement.dataset.stmuiPage);
    if (!s.open || s.top > 700) throw new Error(JSON.stringify(s));
});

await check('switch off: GG row is back and its menus open in the middle with 44px rows', async () => {
    await page.evaluate(() => { const e = document.getElementById('stmui_ggbutton'); e.click(); });
    await page.waitForTimeout(500);
    const s = await page.evaluate(async () => {
        const on = document.documentElement.classList.contains('stmui-gg');
        const btn = !!document.querySelector('.stmui-gg-btn');
        document.getElementById('gg_menu_button').click();
        await new Promise(r => setTimeout(r, 400));
        const m = document.getElementById('gg_tools_menu').getBoundingClientRect();
        const rows = [...document.querySelectorAll('#gg_tools_menu > a')].map(a => a.getBoundingClientRect().height);
        return { on, btn, top: Math.round(m.top), bottom: Math.round(m.bottom), h: innerHeight, minRow: Math.min(...rows) };
    });
    await page.screenshot({ path: `${OUT}/gg-off-menu.png` });
    await page.mouse.click(10, 300);
    await page.evaluate(() => { const e = document.getElementById('stmui_ggbutton'); e.click(); });
    await page.waitForTimeout(500);
    if (s.on || s.btn) throw new Error('patch still on');
    if (s.top < 0 || s.bottom > s.h || s.minRow < 44) throw new Error(JSON.stringify(s));
    return `menu ${s.top}–${s.bottom} of ${s.h}, rows ≥ ${s.minRow}px`;
});

await check('without GG (row removed) the patch steps aside', async () => {
    const s = await page.evaluate(async () => {
        const row = document.getElementById('gg-action-button-container');
        const parent = row.parentNode; const next = row.nextSibling;
        row.remove();
        await new Promise(r => setTimeout(r, 300));
        const off = { on: document.documentElement.classList.contains('stmui-gg'), btn: !!document.querySelector('.stmui-gg-btn'), toggle: document.getElementById('stmui_ggbutton')?.closest('label')?.hidden };
        parent.insertBefore(row, next);
        await new Promise(r => setTimeout(r, 300));
        return { off, back: document.documentElement.classList.contains('stmui-gg') && !!document.querySelector('.stmui-gg-btn') };
    });
    if (s.off.on || s.off.btn || !s.off.toggle || !s.back) throw new Error(JSON.stringify(s));
});

console.log('\nInput History\n');

await check('empty box: arrows and history at the end of the field', async () => {
    await page.locator('#send_textarea').fill('');
    const s = await page.evaluate(() => [...document.querySelectorAll('.stih--button')].map(b => { const r = b.getBoundingClientRect(); return `${b.title}:${Math.round(r.width)}x${Math.round(r.height)}`; }));
    if (s.some(x => x.endsWith(':0x0'))) throw new Error(s.join(' '));
    return s.join(' ');
});

await check('typing hides the arrows, keeps the history button, text gets room', async () => {
    await page.locator('#send_textarea').fill('my own words');
    const s = await page.evaluate(() => ({
        arrows: getComputedStyle(document.querySelector('.stih--arrows')).display,
        clock: document.querySelector('.stih--menuTrigger').getBoundingClientRect().width,
        pad: getComputedStyle(document.getElementById('send_textarea')).paddingInlineEnd,
    }));
    if (s.arrows !== 'none' || s.clock < 44) throw new Error(JSON.stringify(s));
    return JSON.stringify(s);
});

await check('history list opens readable with 44px rows', async () => {
    await page.locator('#send_textarea').fill('');
    await page.locator('.stih--menuTrigger').click();
    await page.waitForTimeout(700);
    const s = await page.evaluate(() => {
        const list = document.querySelector('.stih--history');
        if (!list) return null;
        const r = list.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), items: list.children.length, minRow: Math.min(...[...list.children].map(c => c.getBoundingClientRect().height)), font: getComputedStyle(list).fontSize };
    });
    await page.screenshot({ path: `${OUT}/ih-history.png` });
    await page.locator('.stih--menuTrigger').click();
    await page.waitForTimeout(600);
    if (!s) throw new Error('no list');
    if (s.items && s.minRow < 44) throw new Error(JSON.stringify(s));
    return JSON.stringify(s);
});

await check('no page errors from Pocket Tavern', async () => {
    const ours = errors.filter(e => /stmui|Pocket/i.test(e));
    if (ours.length) throw new Error(ours.join(' | '));
    return errors.length ? `${errors.length} from other code` : '';
});

await page.screenshot({ path: `${OUT}/gg-final.png` });
await browser.close();
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
