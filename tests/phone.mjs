// Opens SillyTavern as a phone (Pixel 7) and walks through Pocket Tavern's main
// features. Needs a running SillyTavern with Pocket Tavern installed:
//   ST_URL=http://127.0.0.1:8000 node phone.mjs
// Set CHROME_CHANNEL=chrome to use an installed Chrome instead of Playwright's.
import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';

const ST_URL = process.env.ST_URL ?? 'http://127.0.0.1:8000';
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || undefined });
const context = await browser.newContext({ ...devices['Pixel 7'] });
const page = await context.newPage();

const extensionErrors = [];
page.on('pageerror', error => {
    if (/Mobile-UI|PocketTavern|stmui/i.test(`${error.stack ?? ''} ${error.message}`)) extensionErrors.push(error.message);
});

let failed = 0;
async function step(name, run) {
    try {
        await run();
        console.log(`  ✓ ${name}`);
    } catch (error) {
        failed++;
        console.log(`  ✗ ${name}\n      ${String(error.message ?? error).split('\n')[0]}`);
        await mkdir('results', { recursive: true });
        await page.screenshot({ path: `results/${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png` }).catch(() => {});
    }
}

const until = (fn, arg, timeout = 8000) => page.waitForFunction(fn, arg, { timeout });
const closeSheet = async () => {
    await page.evaluate(() => document.querySelector('#stmui-sheet .stmui-done')?.click());
    await until(() => !document.getElementById('stmui-sheet'));
};
const dismissPopups = async () => {
    for (let i = 0; i < 5; i++) {
        const open = await page.evaluate(() => {
            const popup = [...document.querySelectorAll('dialog.popup[open]')].pop();
            if (!popup) return false;
            (popup.querySelector('.popup-button-cancel:not(.displayNone)') ?? popup.querySelector('.popup-button-ok'))?.click();
            return true;
        });
        if (!open) return;
        await page.waitForTimeout(500);
    }
};

console.log(`Pocket Tavern phone test on ${ST_URL}\n`);

await step('Pocket Tavern turns on for a phone', async () => {
    await page.goto(ST_URL, { waitUntil: 'domcontentloaded' });
    await until(() => document.documentElement.classList.contains('stmui-on'), null, 60000);
    await page.waitForTimeout(2500);
    await dismissPopups();
    // After an update, What's new opens once; close it so it does not cover the screen.
    if (await page.locator('#stmui-sheet').count()) await closeSheet();
});

await step('top bar and five tabs are shown', async () => {
    await page.locator('#stmui-appbar').waitFor({ state: 'visible' });
    const tabs = await page.locator('.stmui-tab').count();
    if (tabs !== 5) throw new Error(`found ${tabs} tabs`);
});

await step('each tab opens its page and Chat goes back', async () => {
    for (const id of ['rightNavHolder', 'WI-SP-button', 'ai-config-button']) {
        await page.locator(`.stmui-tab[data-tab="${id}"]`).click();
        await until(want => document.documentElement.dataset.stmuiPage === want, id);
    }
    await page.locator('.stmui-tab[data-tab="chat"]').click();
    await until(() => !document.documentElement.dataset.stmuiPage);
});

await step('back gesture closes a page', async () => {
    await page.locator('.stmui-tab[data-tab="ai-config-button"]').click();
    await until(() => document.documentElement.dataset.stmuiPage === 'ai-config-button');
    await page.waitForTimeout(600);
    await page.goBack();
    await until(() => !document.documentElement.dataset.stmuiPage);
});

await step('More sheet lists pages and helpers', async () => {
    await page.locator('.stmui-tab[data-tab="more"]').click();
    await until(() => document.querySelectorAll('#stmui-sheet .stmui-tile').length >= 4);
    const rows = await page.locator('#stmui-sheet .stmui-menu-row').allInnerTexts();
    for (const want of ['Themes', 'Phone features', 'Quick switch', "What's new"]) {
        if (!rows.some(row => row.includes(want))) throw new Error(`missing "${want}"`);
    }
    await closeSheet();
});

await step('a theme can be picked and undone', async () => {
    await page.locator('.stmui-tab[data-tab="more"]').click();
    await page.locator('#stmui-sheet .stmui-menu-row-theme').click();
    await page.locator('#stmui-sheet .stmui-theme-card[data-theme="midnight"]').click();
    await until(() => document.documentElement.dataset.stmuiTheme === 'midnight');
    await page.locator('#stmui-sheet .stmui-theme-card[data-theme="st"]').click();
    await until(() => !document.documentElement.dataset.stmuiTheme);
    await closeSheet();
});

await step('message menu opens from ⋯', async () => {
    await page.evaluate(() => [...document.querySelectorAll('#chat .mes .extraMesButtonsHint')].filter(el => el.offsetParent).pop()?.click());
    await until(() => document.querySelectorAll('#stmui-sheet .stmui-menu-row').length > 0);
    await closeSheet();
});

await step('picture viewer opens from an avatar and closes with back', async () => {
    await page.evaluate(() => [...document.querySelectorAll('#chat .mes .avatar')].filter(el => el.offsetParent).pop()?.click());
    await until(() => document.querySelector('dialog.stmui-viewer')?.open);
    await page.waitForTimeout(400);
    await page.goBack();
    await until(() => !document.querySelector('dialog.stmui-viewer'));
});

await step('quick switch shows persona and connection', async () => {
    await page.locator('.stmui-ab-quick').click();
    const rows = await page.locator('#stmui-sheet .stmui-menu-row').allInnerTexts();
    if (!rows.some(row => row.includes('Persona'))) throw new Error('no Persona row');
    await closeSheet();
});

await step('Translate chat is offered (greyed out until a chat is open)', async () => {
    await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="more"]').click());
    const row = page.locator('#stmui-sheet .stmui-menu-row', { hasText: 'Translate chat' });
    await row.waitFor();
    const inChat = await page.evaluate(() => !!(SillyTavern.getContext().groupId || SillyTavern.getContext().characterId !== undefined));
    if (inChat === (await row.isDisabled())) throw new Error('row enabled state does not match whether a chat is open');
    await closeSheet();
});

await step('chat tools: reply buttons and search this chat', async () => {
    // Needs a character chat; open the first character if none is open.
    await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        if (context.characterId === undefined && !context.groupId && context.characters.length) await context.selectCharacterById('0');
    });
    const inChat = await page.evaluate(() => SillyTavern.getContext().characterId !== undefined);
    if (!inChat) throw new Error('no character to open');
    await until(() => document.querySelectorAll('#chat .mes').length > 0);
    const lastIsUser = await page.evaluate(() => SillyTavern.getContext().chat.at(-1)?.is_user);
    if (!lastIsUser) await until(() => document.querySelector('.stmui-reply-actions:not([hidden])'));
    await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="more"]').click());
    await page.locator('#stmui-sheet .stmui-menu-row', { hasText: 'Search this chat' }).click();
    await until(() => document.querySelector('.stmui-chat-finder input'));
    const word = await page.evaluate(() => document.querySelector('#chat .mes .mes_text')?.textContent.match(/[A-Za-z]{3,}/)?.[0] ?? 'the');
    await page.locator('.stmui-chat-finder input').fill(word);
    await until(() => document.querySelectorAll('mark.stmui-find-mark').length > 0);
    await page.goBack();
    await until(() => !document.querySelector('.stmui-chat-finder') && !document.querySelector('mark.stmui-find-mark'));
});

await step('find a setting searches the Settings page', async () => {
    await page.evaluate(() => document.querySelector('#user-settings-button > .drawer-toggle')?.click());
    await until(() => document.documentElement.dataset.stmuiPage === 'user-settings-button');
    await page.locator('.stmui-ab-search').click();
    await page.locator('#stmui-sheet .stmui-choice-search').fill('font');
    await until(() => document.querySelectorAll('#stmui-sheet .stmui-menu-row').length > 0);
    await closeSheet();
    await page.locator('.stmui-tab[data-tab="chat"]').click();
    await until(() => !document.documentElement.dataset.stmuiPage);
});

await step('search everything finds settings', async () => {
    await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="more"]').click());
    await page.locator('#stmui-sheet .stmui-search-field').click();
    await page.locator('#stmui-sheet .stmui-choice-search').fill('font');
    await until(() => [...document.querySelectorAll('#stmui-sheet .stmui-menu-heading')].some(el => el.textContent === 'Settings'));
    await closeSheet();
});

await step('characters page has search, labeled card tools and tabs', async () => {
    await page.locator('.stmui-tab[data-tab="rightNavHolder"]').click();
    await until(() => document.documentElement.dataset.stmuiPage === 'rightNavHolder');
    await page.locator('#character_search_bar').waitFor({ state: 'visible' });
    const ready = await page.evaluate(() => !!document.getElementById('stmui_card_tabs') && document.querySelectorAll('.stmui-btn-label').length >= 6);
    if (!ready) throw new Error('card tabs or tool labels missing');
    await page.locator('.stmui-tab[data-tab="chat"]').click();
    await until(() => !document.documentElement.dataset.stmuiPage);
});

await step('banner shows when the server stops answering', async () => {
    await page.route('**/api/ping*', route => route.abort());
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await until(() => document.querySelector('.stmui-banner:not(.stmui-banner-ok)'));
    await page.unroute('**/api/ping*');
    await page.locator('.stmui-banner-btn').click();
    await until(() => !document.querySelector('.stmui-banner:not(.stmui-banner-ok)'));
});

await step('turning Pocket Tavern off leaves nothing behind, and on again works', async () => {
    const off = await page.evaluate(async () => {
        document.getElementById('stmui_enabled').click();
        await new Promise(resolve => setTimeout(resolve, 600));
        const stray = [...document.querySelectorAll('[class*="stmui"], [id^="stmui"]')].filter(el => !el.closest('#stmui_settings')).length;
        const classes = document.documentElement.className;
        document.getElementById('stmui_enabled').click();
        return { stray, classes };
    });
    if (off.stray || off.classes.includes('stmui')) throw new Error(`left behind: ${off.stray} nodes, classes "${off.classes}"`);
    await until(() => document.documentElement.classList.contains('stmui-on'));
});

await step('no errors from Pocket Tavern', async () => {
    if (extensionErrors.length) throw new Error(extensionErrors.join(' | '));
});

await browser.close();
console.log(failed ? `\n${failed} step(s) failed. Screenshots are in tests/results.` : '\nAll steps passed.');
process.exit(failed ? 1 : 0);
