// Retakes the README screenshots in docs/screenshots. Run it whenever the look
// changes, then redraw the banner (docs/brand/banner.html) the same way.
// Needs a running SillyTavern with Pocket Tavern installed and only test data
// (never your own chats): the test instance has the Seraphina demo chat and
// sample lorebooks.
//   ST_URL=http://127.0.0.1:8000 CHROME_CHANNEL=chrome node screenshots.mjs [name ...]
// With names, only those screenshots are taken. prompt-editor.jpg needs a Chat
// Completion API and is not retaken here.
import { chromium, devices } from 'playwright';
import { fileURLToPath } from 'node:url';

const ST_URL = process.env.ST_URL ?? 'http://127.0.0.1:8000';
const OUT = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));
const only = new Set(process.argv.slice(2));
const want = name => !only.size || only.has(name);

const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || undefined });
const context = await browser.newContext({ ...devices['Pixel 7'], viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
// Extensions installed on the test copy for compatibility testing (Guided Generations,
// a quick reply set) stay out of the README pictures.
const hideTestExtensions = () => {
    const hide = () => {
        const style = document.createElement('style');
        style.textContent = '#gg-action-button-container, #qr--bar { display: none !important; }';
        document.head.append(style);
    };
    if (document.head) hide();
    else document.addEventListener('DOMContentLoaded', hide);
};
await context.addInitScript(hideTestExtensions);
const page = await context.newPage();

const until = (fn, arg, timeout = 15000) => page.waitForFunction(fn, arg, { timeout });
const settle = async (ms = 700) => {
    await page.waitForTimeout(ms);
    await page.evaluate(() => document.getAnimations().forEach(animation => { try { animation.finish(); } catch { /* ignore */ } }));
    await page.waitForTimeout(150);
};
const shot = async name => {
    await settle();
    await page.screenshot({ path: `${OUT}${name}.jpg`, type: 'jpeg', quality: 85 });
    console.log(`  ✓ ${name}.jpg`);
};
const closeSheet = async () => {
    await page.evaluate(() => document.querySelector('#stmui-sheet .stmui-done')?.click());
    await until(() => !document.getElementById('stmui-sheet'));
    await settle(300);
};
const tab = async id => {
    await page.evaluate(want => document.querySelector(`.stmui-tab[data-tab="${want}"]`).click(), id);
    if (id === 'chat') await until(() => !document.documentElement.dataset.stmuiPage);
    else if (id !== 'more') await until(want => document.documentElement.dataset.stmuiPage === want, id);
    await settle();
};
const openThemes = async () => {
    await tab('more');
    await page.locator('#stmui-sheet .stmui-menu-row-theme').click();
    await settle();
};
const setTheme = async theme => {
    await openThemes();
    await page.locator(`#stmui-sheet .stmui-theme-card[data-theme="${theme}"]`).click();
    await settle(1000);
    await closeSheet();
};
const setLook = async label => {
    await openThemes();
    await page.locator('#stmui-sheet .stmui-look-seg .stmui-seg', { hasText: label }).click();
    await settle();
    await closeSheet();
};
const setPref = async (id, value) => {
    await page.evaluate(([selectId, choice]) => {
        const select = document.getElementById(selectId);
        select.value = choice;
        select.dispatchEvent(new Event('change'));
    }, [id, value]);
    await settle(400);
    await page.evaluate(() => document.getElementById('chat').scrollTo(0, 1e9));
};
const compactShot = async name => {
    await setPref('stmui_size', 'compact');
    await setPref('stmui_composer', 'docked');
    await shot(name);
    await setPref('stmui_size', 'auto');
    await setPref('stmui_composer', 'floating');
};
const openDemoChat = async () => {
    await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        const index = context.characters.findIndex(character => character.name === 'Seraphina');
        if (index < 0) throw new Error('The Seraphina demo character is missing');
        if (String(context.characterId) !== String(index)) await context.selectCharacterById(String(index));
    });
    await until(() => document.querySelectorAll('#chat .mes').length > 1);
    await page.evaluate(() => document.getElementById('chat').scrollTo(0, 1e9));
    await settle(1200);
};

console.log(`Taking screenshots from ${ST_URL}\n`);
await page.goto(ST_URL, { waitUntil: 'domcontentloaded' });
await until(() => document.documentElement.classList.contains('stmui-on'), null, 90000);
await page.waitForTimeout(3000);
await page.evaluate(() => document.querySelectorAll('dialog.popup[open] .popup-button-cancel').forEach(button => button.click()));
if (await page.locator('#stmui-sheet').count()) await closeSheet();

// A known starting point: SillyTavern's own colors and the Cards look.
await setTheme('st');
await setLook('Cards');
await openDemoChat();

// The test copy never really replies, so give the last reply a sample prompt
// record, the kind SillyTavern keeps after each reply. It only lives in this page.
await page.evaluate(async () => {
    const context = SillyTavern.getContext();
    const module = await import('/scripts/itemized-prompts.js');
    const character = context.characters[context.characterId];
    const chat = context.chat;
    const last = chat.map((message, index) => (message.is_user ? -1 : index)).filter(index => index >= 0).pop();
    const history = chat.map(message => `${message.name}: ${message.mes}`).join('\n').repeat(6);
    const lore = 'Eldoria is an old forest kingdom where the oaks remember every traveler. The glade is warded and only opens for those who need healing. '.repeat(14);
    const story = [character.description, character.personality, character.scenario].join('\n');
    module.itemizedPrompts.push({
        mesId: last, main_api: context.mainApi, charDescription: character.description, charPersonality: character.personality,
        scenarioText: character.scenario, userPersona: 'A tired traveler who got lost in the storm.', worldInfoString: lore,
        storyString: `${story}\n${lore}`, examplesString: character.mes_example || '', mesSendString: history,
        finalPrompt: [story, lore, character.mes_example, history].join('\n'),
        this_max_context: Number(context.maxContext) - Number(document.getElementById('amount_gen')?.value || 0), padding: 64,
        instruction: '', promptBias: '', allAnchors: '', summarizeString: '', authorsNoteString: '', smartContextString: '',
        beforeScenarioAnchor: '', afterScenarioAnchor: '', zeroDepthAnchor: '', chatInjects: '', chatVectorsString: '',
        dataBankVectorsString: '', presetName: 'Default', messagesCount: chat.length * 6, examplesCount: 2, rawPrompt: '',
    });
    chat[last].extra = { ...(chat[last].extra ?? {}), model: 'Mistral-Nemo-12B', api: context.mainApi };
});
// Opening the Context page reads the record and fills the ring.
await page.locator('.stmui-ctx-ring').click();
await until(() => document.querySelector('#stmui-sheet .stmui-ctx-list'));
if (want('context')) await shot('context');
await closeSheet();

if (want('chat')) await shot('chat');

if (want('tabs-shown')) {
    await page.locator('.stmui-tabs-btn').click();
    await until(() => !document.documentElement.classList.contains('stmui-tabs-tucked'));
    await shot('tabs-shown');
    await page.locator('.stmui-tabs-btn').click();
    await until(() => document.documentElement.classList.contains('stmui-tabs-tucked'));
}

if (want('compact')) await compactShot('compact');

if (want('bubbles')) {
    await setLook('Bubbles');
    await shot('bubbles');
    await setLook('Cards');
}

if (want('translate')) {
    // Hold the translate button to pick Spanish, then tap it again afterwards for the original.
    const button = page.locator('.stmui-ab-translate');
    await button.dispatchEvent('pointerdown');
    await page.waitForTimeout(700);
    await button.dispatchEvent('pointerup');
    await page.locator('#stmui-sheet .stmui-choice', { hasText: /^Spanish$/ }).first().click();
    await until(() => SillyTavern.getContext().chat.some(message => message.extra?.stmui_lang === 'es'), null, 30000);
    await page.waitForTimeout(2600);
    await page.evaluate(() => document.getElementById('chat').scrollTo(0, 1e9));
    await shot('translate');
    await button.click();
    await until(() => !SillyTavern.getContext().chat.some(message => message.extra?.display_text));
    await settle(2200);
}

if (want('editor')) {
    await page.evaluate(() => [...document.querySelectorAll('#chat .mes:not([is_user="true"]) .mes_edit')].pop()?.click());
    await until(() => document.documentElement.classList.contains('stmui-editing'));
    await shot('editor');
    await page.evaluate(() => document.querySelector('#chat .mes:has(#curEditTextarea) .mes_edit_cancel')?.click());
    await until(() => !document.documentElement.classList.contains('stmui-editing'));
    await settle(1200);
}

if (want('card')) {
    await page.evaluate(() => document.querySelector('.stmui-ab-who').click());
    await until(() => document.documentElement.dataset.stmuiPage === 'rightNavHolder' && document.getElementById('stmui_card_tabs'));
    await shot('card');
    await tab('chat');
}

if (want('characters')) {
    await tab('rightNavHolder');
    await page.evaluate(() => document.getElementById('rm_button_characters')?.click());
    await until(() => document.querySelector('#rm_print_characters_block .character_select'));
    await page.evaluate(() => document.querySelector('#rm_characters_block')?.scrollTo(0, 0));
    await shot('characters');
    await tab('chat');
}

if (want('more')) {
    await tab('more');
    await shot('more');
    await closeSheet();
}

if (want('chat-options')) {
    await page.locator('#options_button').tap();
    await until(() => document.getElementById('stmui-sheet')?.textContent.includes('Manage chat files'));
    await shot('chat-options');
    await closeSheet();
}

if (want('settings') || want('settings-section')) {
    await page.evaluate(() => document.querySelector('#user-settings-button > .drawer-toggle')?.click());
    await until(() => document.querySelectorAll('.stmui-set-home .stmui-menu-row').length > 0);
    if (want('settings')) await shot('settings');
    await page.evaluate(() => [...document.querySelectorAll('.stmui-set-home .stmui-menu-row')].find(row => row.textContent.includes('Display'))?.click());
    await until(() => document.querySelector('.stmui-ab-title')?.textContent === 'Display');
    if (want('settings-section')) await shot('settings-section');
    await tab('chat');
}

if (want('themes')) {
    await openThemes();
    await shot('themes');
    await closeSheet();
}

if (want('lorebooks')) {
    await tab('WI-SP-button');
    await page.evaluate(() => document.querySelector('#WorldInfo .stmui-open')?.click());
    await until(() => document.getElementById('stmui-sheet'));
    await shot('lorebooks');
    await closeSheet();
    await tab('chat');
}

if (want('lorebook-entries')) {
    await tab('WI-SP-button');
    await page.evaluate(() => {
        const select = document.getElementById('world_editor_select');
        const option = [...select.options].find(item => item.textContent.trim() === 'Eldoria');
        if (option) window.jQuery(select).val(option.value).trigger('change');
    });
    await until(() => document.querySelectorAll('#world_popup_entries_list .world_entry').length > 0);
    await settle(1200);
    await page.evaluate(() => document.getElementById('world_popup_entries_list').scrollIntoView({ block: 'start' }));
    await page.evaluate(() => document.querySelector('#WorldInfo .drawer-content, #WorldInfo')?.scrollBy?.(0, -70));
    await shot('lorebook-entries');
    await tab('chat');
}

if (want('presets')) {
    await tab('ai-config-button');
    await page.evaluate(() => {
        const first = [...document.querySelectorAll('.stmui-step-wrap, .range-block-counter.stmui-stepper')].find(el => el.offsetParent);
        first?.closest('.flex-container, .range-block')?.scrollIntoView({ block: 'start' });
    });
    await shot('presets');
    await tab('chat');
}

if (want('personas')) {
    await page.evaluate(() => document.querySelector('#persona-management-button > .drawer-toggle')?.click());
    await until(() => document.documentElement.dataset.stmuiPage === 'persona-management-button');
    await shot('personas');
    await tab('chat');
}

if (want('midnight')) {
    await setTheme('midnight');
    await openDemoChat();
    await shot('midnight');
}

if (want('light')) {
    await setTheme('paper');
    await openDemoChat();
    await shot('light');
}

if (want('compact-light')) {
    await setTheme('paper');
    await openDemoChat();
    await compactShot('compact-light');
}

await setTheme('st');

if (want('recent')) {
    await page.locator('.stmui-ab-home').click();
    await until(() => document.querySelector('.recentChat'));
    await shot('recent');
}

if (want('before')) {
    await openDemoChat();
    await page.evaluate(() => document.getElementById('stmui_enabled').click());
    await until(() => !document.documentElement.classList.contains('stmui-on'));
    await page.evaluate(() => document.getElementById('chat').scrollTo(0, 1e9));
    await shot('before');
    await page.evaluate(() => document.getElementById('stmui_enabled').click());
    await until(() => document.documentElement.classList.contains('stmui-on'));
}

if (want('desktop')) {
    // The desktop layout: a computer, where Automatic turns Pocket Tavern on by itself.
    const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await desk.addInitScript(hideTestExtensions);
    const tabPage = await desk.newPage();
    await tabPage.goto(ST_URL, { waitUntil: 'domcontentloaded' });
    await tabPage.waitForFunction(() => document.documentElement.classList.contains('stmui-wide'), null, { timeout: 120000 });
    await tabPage.waitForTimeout(2500);
    await tabPage.evaluate(() => document.querySelector('#stmui-sheet .stmui-done')?.click());
    await tabPage.evaluate(async () => {
        const context = SillyTavern.getContext();
        await context.selectCharacterById(String(context.characters.findIndex(item => item.name === 'Seraphina')));
    });
    await tabPage.waitForTimeout(2000);
    await tabPage.locator('.stmui-tab[data-tab="ai-config-button"]').click();
    await tabPage.waitForTimeout(1200);
    await tabPage.evaluate(() => document.getElementById('chat').scrollTo(0, 1e9));
    await tabPage.evaluate(() => document.getAnimations().forEach(animation => { try { animation.finish(); } catch {} }));
    await tabPage.waitForTimeout(400);
    await tabPage.screenshot({ path: `${OUT}desktop.jpg`, type: 'jpeg', quality: 85 });
    console.log('  ✓ desktop.jpg');
    await desk.close();
}

await browser.close();
console.log('\nDone. Check the pictures, then run node brand.mjs to redraw the banner if chat, settings or characters changed.');
