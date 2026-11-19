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
// In a chat the tabs are tucked away; the arrow in the message box brings them back.
const showTabs = async () => {
    if (await page.evaluate(() => document.documentElement.classList.contains('stmui-tabs-tucked'))) {
        await page.locator('.stmui-tabs-btn').click();
        await until(() => !document.documentElement.classList.contains('stmui-tabs-tucked'));
    }
};
const setPref = async (id, value) => {
    await page.evaluate(([selectId, choice]) => {
        const select = document.getElementById(selectId);
        select.value = choice;
        select.dispatchEvent(new Event('change'));
    }, [id, value]);
    await page.waitForTimeout(400);
};
// How far the newest message reaches under the message box (0 or less: not covered).
const lastMessageCovered = () => page.evaluate(async () => {
    const chat = document.getElementById('chat');
    chat.scrollTo(0, chat.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 400));
    const last = [...chat.querySelectorAll('.mes')].pop();
    return last.getBoundingClientRect().bottom - document.getElementById('send_form').getBoundingClientRect().top;
});
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

await step("a character's animated picture that no longer exists falls back to its normal picture", async () => {
    // Before: SillyTavern swapped the failed picture for its crossed-out "missing picture" icon.
    const was = await page.evaluate(async () => {
        if (SillyTavern.getContext().characterId === undefined) await SillyTavern.getContext().selectCharacterById('0');
        const c = SillyTavern.getContext();
        const s = c.extensionSettings.mobileUI;
        const character = c.characters[c.characterId];
        const before = { animated: s.animatedPictures, link: character.data.extensions.stmui_animated_avatar };
        s.animatedPictures = true;
        character.data.extensions.stmui_animated_avatar = '/user/files/deleted-test-picture.gif';
        await c.reloadCurrentChat();
        return before;
    });
    try {
        await page.waitForTimeout(2500);
        const r = await page.evaluate(() => [...document.querySelectorAll('#chat .mes[is_user="false"]')].map(m => ({ missing: !!m.querySelector('.missing-avatar'), src: m.querySelector('.avatar img')?.getAttribute('src') ?? '' })));
        if (!r.length) throw new Error('no AI messages to check');
        const bad = r.filter(m => m.missing || m.src.includes('deleted-test-picture'));
        if (bad.length) throw new Error(JSON.stringify(bad));
    } finally {
        await page.evaluate(async before => {
            const c = SillyTavern.getContext();
            c.extensionSettings.mobileUI.animatedPictures = before.animated;
            c.characters[c.characterId].data.extensions.stmui_animated_avatar = before.link;
            await c.reloadCurrentChat();
        }, was);
        await page.waitForTimeout(1000);
    }
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

await step('message box: persona button, context ring and Context page; search this chat', async () => {
    // Needs a character chat; open the first character if none is open.
    await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        if (context.characterId === undefined && !context.groupId && context.characters.length) await context.selectCharacterById('0');
    });
    const inChat = await page.evaluate(() => SillyTavern.getContext().characterId !== undefined);
    if (!inChat) throw new Error('no character to open');
    await until(() => document.querySelectorAll('#chat .mes').length > 0);
    await until(() => document.querySelector('#leftSendForm .stmui-persona-chip img') && document.querySelector('#rightSendForm .stmui-ctx-ring'));
    await page.locator('.stmui-ctx-ring').click();
    await until(() => document.querySelector('#stmui-sheet .stmui-ctx-hero'));
    await closeSheet();
    // Your persona: edit the description quickly, check it saved, then put it back.
    const before = await page.evaluate(() => SillyTavern.getContext().powerUserSettings.persona_description ?? '');
    try {
    for (const text of ['Pocket Tavern test description', before]) {
        await page.locator('.stmui-persona-chip').click();
        await until(() => document.querySelector('#stmui-sheet .stmui-persona-card-edit'));
        await page.locator('#stmui-sheet .stmui-persona-card-edit').click();
        await until(() => document.querySelector('#stmui-sheet .stmui-pe-text'));
        // Tap the box first, like a person: the editor opens without the keyboard.
        await page.locator('#stmui-sheet .stmui-pe-text').tap();
        await page.locator('#stmui-sheet .stmui-pe-text').fill(text);
        await page.locator('#stmui-sheet .stmui-pe-save').click();
        await until(() => !document.getElementById('stmui-sheet'));
        const saved = await page.evaluate(() => SillyTavern.getContext().powerUserSettings.persona_description ?? '');
        if (saved !== text) throw new Error(`persona description not saved (got "${saved.slice(0, 30)}")`);
    }
    } finally {
        // Whatever happened above, leave the persona as it was.
        await page.evaluate(async original => {
            const box = document.getElementById('persona_description');
            if (!box || box.value === original) return;
            box.value = original;
            box.dispatchEvent(new Event('input', { bubbles: true }));
            await SillyTavern.getContext().saveSettings?.();
        }, before);
        if (await page.locator('#stmui-sheet').count()) await closeSheet();
    }
    await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="more"]').click());
    await page.locator('#stmui-sheet .stmui-menu-row', { hasText: 'Search this chat' }).click();
    await until(() => document.querySelector('.stmui-chat-finder input'));
    const word = await page.evaluate(() => document.querySelector('#chat .mes .mes_text')?.textContent.match(/[A-Za-z]{3,}/)?.[0] ?? 'the');
    await page.locator('.stmui-chat-finder input').fill(word);
    await until(() => document.querySelectorAll('mark.stmui-find-mark').length > 0);
    await page.goBack();
    await until(() => !document.querySelector('.stmui-chat-finder') && !document.querySelector('mark.stmui-find-mark'));
});

await step('tapping the text of a reply does not change its version', async () => {
    await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        if (context.characterId === undefined && context.characters.length) await context.selectCharacterById('0');
    });
    await until(() => document.querySelectorAll('#chat .mes').length > 0);
    const original = await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        const id = context.chat.length - 1;
        const message = context.chat[id];
        const before = structuredClone(message);
        // Three versions, showing the second (only in this page; nothing is saved meanwhile).
        window.__stmuiSave = [context.saveChat, context.saveChatDebounced];
        context.saveChat = async () => {};
        context.saveChatDebounced = () => {};
        message.swipes = [message.mes, 'Second version, long enough to tap in the middle of its text.', 'Third version.'];
        message.swipe_info = [{}, {}, {}];
        message.swipe_id = 1;
        message.mes = message.swipes[1];
        context.updateMessageBlock(id, message);
        (await import('/script.js')).refreshSwipeButtons?.();
        document.getElementById('chat').scrollTo(0, 1e9);
        return before;
    });
    await page.waitForTimeout(600);
    const text = await page.locator('#chat .mes.last_mes .mes_text').boundingBox();
    await page.touchscreen.tap(text.x + text.width / 2, text.y + text.height / 2);
    await page.waitForTimeout(800);
    const afterTap = await page.evaluate(() => SillyTavern.getContext().chat.at(-1).swipe_id);
    // Put the message back as it was.
    await page.evaluate(original => {
        const context = SillyTavern.getContext();
        const id = context.chat.length - 1;
        context.chat[id] = original;
        context.updateMessageBlock(id, original);
        [context.saveChat, context.saveChatDebounced] = window.__stmuiSave;
    }, original);
    if (afterTap !== 1) throw new Error(`a tap on the text changed the version to ${afterTap}`);
});

await step('recent chats are grouped by character', async () => {
    await page.locator('.stmui-ab-home').click();
    await until(() => document.querySelector('#chat .welcomePanel .recentChatList'));
    const grouped = await page.evaluate(() => {
        const rows = document.querySelectorAll('.recentChatList .recentChat:not(:has(.recentChatPinned))').length;
        return { rows, groups: document.querySelectorAll('.stmui-chat-group').length, loose: document.querySelectorAll('.recentChatList > .recentChat:not(:has(.recentChatPinned))').length };
    });
    if (grouped.rows && (!grouped.groups || grouped.loose)) throw new Error(`groups ${grouped.groups}, loose rows ${grouped.loose}`);
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

await step('Settings opens on its sections; a section, explanations, search and back work', async () => {
    await page.evaluate(() => document.querySelector('#user-settings-button > .drawer-toggle')?.click());
    await until(() => document.documentElement.dataset.stmuiPage === 'user-settings-button');
    await until(() => document.querySelectorAll('.stmui-set-home .stmui-menu-row').length >= 6);
    if (!await page.evaluate(() => getComputedStyle(document.getElementById('user-settings-block-content')).display === 'none')) throw new Error('the list of sections also shows every setting');
    await page.locator('.stmui-set-home .stmui-menu-row', { hasText: 'Display' }).click();
    await until(() => document.querySelector('.stmui-ab-title')?.textContent === 'Display');
    const shown = await page.evaluate(() => ({
        display: !!document.getElementById('messageTimestampsEnabled')?.closest('label')?.offsetParent,
        look: !!document.getElementById('themes')?.offsetParent,
        tips: document.querySelectorAll('#user-settings-block .stmui-help').length,
    }));
    if (!shown.display || shown.look) throw new Error(`wrong settings in Display: ${JSON.stringify(shown)}`);
    if (shown.tips < 10) throw new Error(`only ${shown.tips} explanations`);
    // A tap on an explanation shows all of it and leaves its switch alone.
    const before = await page.evaluate(() => document.getElementById('reduced_motion').checked);
    await page.locator('label[for="reduced_motion"] .stmui-help').click();
    const after = await page.evaluate(() => ({ checked: document.getElementById('reduced_motion').checked, open: document.querySelector('label[for="reduced_motion"] .stmui-help').classList.contains('stmui-help-open') }));
    if (after.checked !== before || !after.open) throw new Error('tapping the explanation flipped the switch, or did not open it');
    await page.waitForTimeout(500);
    await page.goBack();
    await until(() => document.querySelector('.stmui-ab-title')?.textContent === 'Settings' && document.documentElement.dataset.stmuiPage === 'user-settings-button');
    // Search from the list goes into the right section.
    await page.locator('.stmui-set-home .stmui-search-field').click();
    await page.locator('#stmui-sheet .stmui-choice-search').fill('font scale');
    await page.locator('#stmui-sheet .stmui-menu-row').first().click();
    await until(() => document.querySelector('.stmui-ab-title')?.textContent === 'Look');
    await page.waitForTimeout(500);
    await page.goBack();
    await until(() => document.querySelector('.stmui-ab-title')?.textContent === 'Settings');
    await page.waitForTimeout(500);
    await page.goBack();
    await until(() => !document.documentElement.dataset.stmuiPage);

});

await step('☰ and the wand open sheets, and their items work', async () => {
    await page.evaluate(async () => { const c = SillyTavern.getContext(); await c.selectCharacterById(String(c.characters.findIndex(x => x.name === 'Seraphina'))); });
    await until(() => document.querySelectorAll('#chat .mes').length > 0);
    await page.locator('#options_button').tap();
    await until(() => document.getElementById('stmui-sheet')?.textContent.includes('Manage chat files'));
    const groups = await page.evaluate(() => [...document.querySelectorAll('#stmui-sheet .stmui-menu-heading')].map(el => el.textContent));
    if (!groups.includes('Reply') || !groups.includes('Chats')) throw new Error(`groups: ${groups.join(', ')}`);
    if (await page.evaluate(() => getComputedStyle(document.getElementById('options')).display !== 'none')) throw new Error("SillyTavern's own menu opened too");
    await page.locator('#stmui-sheet .stmui-menu-row', { hasText: 'Manage chat files' }).click();
    await until(() => getComputedStyle(document.getElementById('shadow_select_chat_popup')).display !== 'none');
    await page.waitForTimeout(500);
    await page.goBack();
    await until(() => getComputedStyle(document.getElementById('shadow_select_chat_popup')).display === 'none');
    await page.locator('#extensionsMenuButton').tap();
    await until(() => document.getElementById('stmui-sheet')?.textContent.includes('Token Counter'));
    await page.locator('#stmui-sheet .stmui-menu-row', { hasText: 'Token Counter' }).click();
    await until(() => !!document.querySelector('dialog.popup[open]'));
    await page.waitForTimeout(500);
    await page.goBack();
    await until(() => !document.querySelector('dialog.popup[open]'));
});

await step('search everything finds settings', async () => {
    await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="more"]').click());
    await page.locator('#stmui-sheet .stmui-search-field').click();
    await page.locator('#stmui-sheet .stmui-choice-search').fill('font');
    await until(() => [...document.querySelectorAll('#stmui-sheet .stmui-menu-heading')].some(el => el.textContent === 'Settings'));
    await closeSheet();
});

await step('characters page has search, labeled card tools and tabs', async () => {
    await showTabs();
    await page.locator('.stmui-tab[data-tab="rightNavHolder"]').click();
    await until(() => document.documentElement.dataset.stmuiPage === 'rightNavHolder');
    await page.locator('#character_search_bar').waitFor({ state: 'visible' });
    const ready = await page.evaluate(() => !!document.getElementById('stmui_card_tabs') && document.querySelectorAll('.stmui-btn-label').length >= 6);
    if (!ready) throw new Error('card tabs or tool labels missing');
    await page.locator('.stmui-tab[data-tab="chat"]').click();
    await until(() => !document.documentElement.dataset.stmuiPage);
});

await step('character list shows its page buttons when there is more than one page', async () => {
    // A fresh SillyTavern has one character: add a throwaway one so there can be a second page.
    const added = await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        if (context.characters.length + (context.groups?.length ?? 0) >= 2) return null;
        const st = await import('/script.js');
        const response = await fetch('/api/characters/create', { method: 'POST', headers: st.getRequestHeaders(), body: JSON.stringify({ ch_name: 'Page test' }) });
        if (!response.ok) throw new Error(`could not add a test character: ${response.status}`);
        await st.getCharacters();
        return response.text();
    });
    // A page size that always leaves a second page, however few characters there are.
    const count = await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        const total = context.characters.length + (context.groups?.length ?? 0);
        const { accountStorage } = await import('/scripts/util/AccountStorage.js');
        accountStorage.setItem('Characters_PerPage', String(Math.max(1, Math.floor((total - 1) / 2) || 1)));
        await (await import('/script.js')).printCharacters(true);
        return total;
    });
    if (count < 2) throw new Error('the test needs at least two characters');
    await showTabs();
    await page.locator('.stmui-tab[data-tab="rightNavHolder"]').click();
    await until(() => document.documentElement.dataset.stmuiPage === 'rightNavHolder');
    try {
        const next = page.locator('#rm_print_characters_pagination .paginationjs-next > a');
        await next.waitFor({ state: 'visible' });
        const size = await next.boundingBox();
        if (size.height < 44 || size.width < 44) throw new Error(`page button is ${size.width}x${size.height}`);
        const before = await page.evaluate(() => document.querySelector('#rm_print_characters_pagination .paginationjs-nav')?.textContent);
        await next.click();
        await until(was => document.querySelector('#rm_print_characters_pagination .paginationjs-nav')?.textContent !== was, before);
    } finally {
        await page.evaluate(async () => {
            const { accountStorage } = await import('/scripts/util/AccountStorage.js');
            accountStorage.setItem('Characters_PerPage', '50');
            await (await import('/script.js')).printCharacters(true);
        });
        if (added) await page.evaluate(async avatar => (await import('/script.js')).deleteCharacter(avatar, { deleteChats: true }), added).catch(() => {});
    }
    await page.locator('.stmui-tab[data-tab="chat"]').click();
    await until(() => !document.documentElement.dataset.stmuiPage);
});

await step('in a chat the tabs tuck away; the arrow brings them back and typing hides them again', async () => {
    await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        if (context.characterId === undefined && !context.groupId) await context.selectCharacterById('0');
    });
    await until(() => document.querySelectorAll('#chat .mes').length > 0);
    await until(() => document.documentElement.classList.contains('stmui-tabs-tucked'));
    // Hidden from touch and screen readers once it has slid away (0.2s).
    await until(() => getComputedStyle(document.querySelector('.stmui-tabbar')).display === 'none', null, 2000)
        .catch(() => { throw new Error('the tucked tab bar can still be reached'); });
    const arrow = page.locator('.stmui-tabs-btn');
    if (await arrow.getAttribute('aria-expanded') !== 'false') throw new Error('the arrow does not say the tabs are hidden');
    const box = await arrow.boundingBox();
    if (box.width < 44 || box.height < 44) throw new Error(`the arrow is ${box.width}x${box.height}`);
    await arrow.click();
    await page.locator('.stmui-tab[data-tab="WI-SP-button"]').waitFor({ state: 'visible' });
    if (await arrow.getAttribute('aria-expanded') !== 'true') throw new Error('the arrow does not say the tabs are shown');
    await page.locator('#send_textarea').click();
    await until(() => document.documentElement.classList.contains('stmui-tabs-tucked'));
    await page.evaluate(() => document.activeElement?.blur());
    const covered = await lastMessageCovered();
    if (covered > 1) throw new Error(`the newest message is ${covered}px under the message box`);
});

await step('the keyboard: chat and message box slide as one piece, and the tabs go at once', async () => {
    // Before: the chat jumped while the box slid on its own, leaving a gap (opening) or an overlap (closing).
    const size = page.viewportSize();
    const record = () => page.evaluate(() => {
        window.__kb = [];
        const t0 = performance.now();
        const tick = () => {
            const last = [...document.querySelectorAll('#chat .mes')].pop().getBoundingClientRect().bottom;
            const box = document.getElementById('form_sheld').getBoundingClientRect();
            const root = document.documentElement;
            const chat = document.getElementById('chat');
            window.__kb.push({ full: chat.scrollHeight > chat.clientHeight + 40, gap: Math.round(box.top - last), bottom: Math.round(box.bottom), vh: innerHeight, kb: root.classList.contains('stmui-keyboard'), tabs: getComputedStyle(document.querySelector('.stmui-tabbar')).display !== 'none' });
            if (performance.now() - t0 < 700) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
    const frames = async () => {
        await page.waitForTimeout(900);
        return page.evaluate(() => window.__kb);
    };
    const steady = (rows, label) => {
        const gaps = rows.map(r => r.gap);
        // A short chat (a fresh SillyTavern: just the greeting) does not reach the box; the box may move away from it, never over it.
        if (!rows.every(r => r.full)) {
            if (Math.min(...gaps) < -1) throw new Error(`${label}: the box covered the newest message by ${-Math.min(...gaps)}px`);
        } else if (Math.max(...gaps) - Math.min(...gaps) > 3) throw new Error(`${label}: the gap between the newest message and the box went ${Math.min(...gaps)}–${Math.max(...gaps)}px`);
        const end = rows.at(-1);
        if (end.bottom > end.vh + 1) throw new Error(`${label}: the box ends at ${end.bottom}, below the screen (${end.vh})`);
    };
    try {
        await page.locator('.stmui-tabs-btn').click();
        await page.locator('.stmui-tab[data-tab="WI-SP-button"]').waitFor({ state: 'visible' });
        await page.evaluate(() => { const chat = document.getElementById('chat'); chat.scrollTop = chat.scrollHeight; });
        await page.waitForTimeout(300);
        await record();
        await page.locator('#send_textarea').focus();
        await page.setViewportSize({ width: size.width, height: size.height - 330 });
        const open = await frames();
        if (open.some(r => r.kb && r.tabs)) throw new Error('the tab bar was still showing above the keyboard');
        steady(open, 'opening');
        if (await page.evaluate(() => document.getElementById('sheld').style.height)) throw new Error('the chat kept a size from the slide');
        await record();
        await page.setViewportSize(size);
        const close = await frames();
        steady(close, 'closing');
    } finally {
        await page.setViewportSize(size);
        await page.evaluate(() => document.activeElement?.blur());
        await page.waitForTimeout(400);
    }
});

await step('editing the last message keeps the editor and the top bar on the screen', async () => {
    // With the tabs tucked away, opening the editor used to scroll the whole page up.
    await until(() => document.documentElement.classList.contains('stmui-tabs-tucked'));
    await page.waitForTimeout(400);
    const tall = await page.evaluate(() => document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight);
    if (tall > 0) throw new Error(`the page is ${tall}px taller than the screen`);
    await page.evaluate(() => [...document.querySelectorAll('#chat .mes')].pop().querySelector('.mes_edit').click());
    await until(() => document.documentElement.classList.contains('stmui-editing'));
    await page.waitForTimeout(600);
    const state = await page.evaluate(() => ({
        scrolled: window.scrollY,
        bar: document.getElementById('stmui-appbar').getBoundingClientRect().top,
        box: document.getElementById('curEditTextarea').getBoundingClientRect().top,
    }));
    await page.evaluate(() => document.querySelector('#chat .mes:has(#curEditTextarea) .mes_edit_cancel')?.click());
    await until(() => !document.documentElement.classList.contains('stmui-editing'));
    if (state.scrolled || state.bar < 0 || state.box < state.bar) throw new Error(`the editor moved off the screen: ${JSON.stringify(state)}`);
});

await step("the editor fills the page in every chat look, for your messages and the AI's", async () => {
    // In the Bubbles look the editor used to shrink to its text and sit at one edge.
    const results = await page.evaluate(async () => {
        const root = document.documentElement;
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        const out = [];
        for (const look of ['cards', 'bubbles', 'flat']) {
            if (look === 'cards') delete root.dataset.stmuiLook;
            else root.dataset.stmuiLook = look;
            const messages = [...document.querySelectorAll('#chat .mes')];
            for (const mes of [messages.find(m => m.getAttribute('is_user') === 'true'), messages.at(-1)].filter(Boolean)) {
                mes.querySelector('.mes_edit').click();
                await wait(600);
                const box = document.getElementById('curEditTextarea')?.getBoundingClientRect();
                const bar = document.getElementById('stmui-appbar').getBoundingClientRect();
                out.push({ look, user: mes.getAttribute('is_user'), top: Math.round(box?.top ?? -1), height: Math.round(box?.height ?? 0), below: Math.round(bar.bottom), screen: innerHeight });
                document.querySelector('#chat .mes:has(#curEditTextarea) .mes_edit_cancel')?.click();
                await wait(500);
            }
        }
        delete root.dataset.stmuiLook;
        return out;
    });
    const bad = results.filter(r => r.height < r.screen * 0.4 || r.top < r.below || r.top > r.below + 80);
    if (bad.length) throw new Error(`editor too small or misplaced: ${JSON.stringify(bad)}`);
});

await step('compact size and docked message box fit more chat and keep 44px buttons', async () => {
    await setPref('stmui_size', 'comfortable');
    await setPref('stmui_composer', 'floating');
    const before = await page.evaluate(() => document.querySelector('#chat .mes').getBoundingClientRect().height);
    await setPref('stmui_size', 'compact');
    await setPref('stmui_composer', 'docked');
    try {
        const state = await page.evaluate(() => ({
            classes: document.documentElement.className,
            bar: document.getElementById('stmui-appbar').getBoundingClientRect().height,
            card: document.querySelector('#chat .mes').getBoundingClientRect().height,
            small: [...document.querySelectorAll('#send_form .stmui-tabs-btn, #send_form #options_button, #chat .mes .mes_button:not([style*="none"])')]
                .map(el => el.getBoundingClientRect())
                .filter(rect => rect.width && (rect.width < 44 || rect.height < 44)).length,
        }));
        if (!state.classes.includes('stmui-compact') || !state.classes.includes('stmui-docked')) throw new Error(`classes: ${state.classes}`);
        if (state.bar > 49) throw new Error(`top bar is ${state.bar}px`);
        if (state.card >= before) throw new Error('message cards did not get smaller');
        if (state.small) throw new Error(`${state.small} buttons under 44px`);
        // Docked: persona, field and Send share the bottom row, level with each other.
        const row = await page.evaluate(() => {
            const box = selector => document.querySelector(selector).getBoundingClientRect();
            const field = box('#send_textarea');
            const send = box('#send_but');
            const persona = box('#send_form .stmui-persona-chip');
            return {
                send: Math.abs(send.bottom - field.bottom) <= 1 && send.left >= field.right,
                persona: Math.abs(persona.bottom - field.bottom) <= 1 && persona.right <= field.left,
                edge: window.innerHeight - send.bottom,
                // SillyTavern's clip used to cut off the field's top edge.
                topEdge: document.elementFromPoint(field.left + field.width / 2, field.top + 2)?.id === 'send_textarea',
            };
        });
        if (!row.send || !row.persona) throw new Error(`the bottom row is not persona, field, Send: ${JSON.stringify(row)}`);
        if (row.edge < 4) throw new Error(`Send is ${row.edge}px from the bottom edge`);
        if (!row.topEdge) throw new Error('the top edge of the docked text field is cut off');
        const covered = await lastMessageCovered();
        if (covered > 1) throw new Error(`the newest message is ${covered}px under the message box`);
    } finally {
        await setPref('stmui_size', 'auto');
        await setPref('stmui_composer', 'floating');
    }
});

await step('Guided Generations becomes one button with a sheet; Input History sits in the text field', async () => {
    // The real extensions when they are installed (the test copy), otherwise stand-ins with the same markup.
    const made = await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        if (context.characterId === undefined && !context.groupId) await context.selectCharacterById('0');
        const made = { gg: false, ih: false };
        if (!document.getElementById('gg-action-button-container')) {
            made.gg = true;
            const row = document.createElement('div');
            row.id = 'gg-action-button-container';
            row.className = 'gg-action-buttons-container';
            row.innerHTML = '<div id="gg-menu-buttons-container" class="gg-menu-buttons-container"><div id="gg_menu_button" class="gg-menu-button fa-solid fa-bookmark"></div><div id="pg_menu_button" class="gg-menu-button fa-solid fa-book-open-reader"><span id="pg_guide_counter_span" class="pg-guide-counter"> 0</span></div></div>'
                + '<div id="gg-qr-container" class="gg-qr-container"></div>'
                + '<div id="gg-regular-buttons-container" class="gg-regular-buttons-container"><div id="gg_impersonate_button" class="gg-action-button fa-solid fa-user" title="Guided Impersonate (1st Person)"></div><div id="gg_swipe_button" class="gg-action-button fa-solid fa-forward" title="Guided Swipe"></div><div id="gg_response_button" class="gg-action-button fa-solid fa-dog" title="Guided Response"></div></div>';
            const items = document.getElementById('nonQRFormItems');
            items.parentNode.insertBefore(row, items.nextSibling);
            for (const [id, labels] of [['gg_tools_menu', ['Simple Send', 'Recover Input', null, 'Spellchecker', 'Help']], ['pg_tools_menu', ['Situational', 'Thinking', null, 'Show Guides']]]) {
                const menu = document.createElement('div');
                menu.id = id;
                menu.className = 'gg-tools-menu';
                for (const label of labels) {
                    const node = document.createElement(label ? 'a' : 'hr');
                    if (label) {
                        node.href = '#';
                        node.className = 'interactable';
                        node.title = `What ${label} does`;
                        node.innerHTML = `<i class="fa-solid fa-star fa-fw"></i><span>${label}</span>`;
                    }
                    menu.append(node);
                }
                document.body.append(menu);
            }
        }
        if (!document.querySelector('.stih--buttons')) {
            made.ih = true;
            const wrap = document.createElement('div');
            wrap.className = 'stih--buttons';
            wrap.innerHTML = '<div class="stih--arrows"><div class="stih--button menu_button fa-solid fa-chevron-up" title="Previous input"></div><div class="stih--button menu_button fa-solid fa-chevron-down" title="Next input"></div></div><div class="stih--button menu_button stih--menuTrigger fa-solid fa-clock-rotate-left" title="Input History"></div>';
            document.getElementById('send_textarea').insertAdjacentElement('afterend', wrap);
        }
        // Record presses on its buttons and menu items instead of running them.
        window.__ggPressed = [];
        document.querySelectorAll('#gg-action-button-container .gg-action-button, #gg_tools_menu > a, #pg_tools_menu > a').forEach(node => {
            node.addEventListener('click', event => {
                window.__ggPressed.push(node.id || node.textContent.trim());
                event.stopImmediatePropagation();
                event.preventDefault();
            }, true);
        });
        return made;
    });
    try {
        await page.locator('.stmui-gg-btn').waitFor({ state: 'visible' });
        const layout = await page.evaluate(() => {
            const button = document.querySelector('.stmui-gg-btn').getBoundingClientRect();
            const field = document.getElementById('send_textarea').getBoundingClientRect();
            const history = document.querySelector('.stih--menuTrigger').getBoundingClientRect();
            return {
                size: Math.min(button.width, button.height),
                beforeSend: document.querySelector('.stmui-gg-btn').nextElementSibling?.id === 'send_but',
                rowHidden: getComputedStyle(document.getElementById('gg-regular-buttons-container')).display === 'none',
                historyInField: history.width >= 44 && Math.abs((history.top + history.bottom) / 2 - (field.top + field.bottom) / 2) <= field.height / 2 && history.right <= field.right + 1,
            };
        });
        if (layout.size < 44 || !layout.beforeSend || !layout.rowHidden || !layout.historyInField) throw new Error(`layout: ${JSON.stringify(layout)}`);

        await page.locator('#send_textarea').fill('Have her mention the letter');
        if (await page.evaluate(() => getComputedStyle(document.querySelector('.stih--arrows')).display) !== 'none') throw new Error('Input History arrows cover the text you are typing');

        await page.locator('.stmui-gg-btn').click();
        await page.locator('#stmui-sheet .stmui-gg-instruction', { hasText: 'Have her mention the letter' }).waitFor();
        await page.locator('#stmui-sheet .stmui-menu-row', { hasText: 'Guided swipe' }).click();
        await until(() => !document.getElementById('stmui-sheet'));
        if (await page.evaluate(() => window.__ggPressed.at(-1)) !== 'gg_swipe_button') throw new Error('Guided swipe did not press its button');

        await page.locator('.stmui-gg-btn').click();
        await page.locator('#stmui-sheet .stmui-menu-row', { hasText: 'Tools' }).click();
        await page.locator('#stmui-sheet .stmui-menu-row', { hasText: 'Spellchecker' }).click();
        await until(() => !document.getElementById('stmui-sheet'));
        const pressed = await page.evaluate(() => ({ last: window.__ggPressed.at(-1), hash: location.hash }));
        if (pressed.last !== 'Spellchecker' || pressed.hash) throw new Error(`tools: ${JSON.stringify(pressed)}`);

        // Holding the button runs the last action again.
        const box = await page.locator('.stmui-gg-btn').boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(700);
        await page.mouse.up();
        await page.waitForTimeout(200);
        const held = await page.evaluate(() => ({ last: window.__ggPressed.at(-1), sheet: !!document.getElementById('stmui-sheet') }));
        if (held.last !== 'gg_swipe_button' || held.sheet) throw new Error(`hold: ${JSON.stringify(held)}`);
    } finally {
        await page.evaluate(made => {
            document.getElementById('send_textarea').value = '';
            if (made.gg) {
                document.getElementById('gg-action-button-container')?.remove();
                document.getElementById('gg_tools_menu')?.remove();
                document.getElementById('pg_tools_menu')?.remove();
            }
            if (made.ih) document.querySelector('.stih--buttons')?.remove();
        }, made);
    }
    if (made.gg) {
        await until(() => !document.documentElement.classList.contains('stmui-gg') && !document.querySelector('.stmui-gg-btn'));
    }
});

await step("another extension's buttons and a theme's CSS keep the text on its own row", async () => {
    // Guided Generations puts a row of buttons in the box; some themes stop the box from wrapping.
    // (Its row as it looks with the Guided Generations button switched off.)
    const result = await page.evaluate(async () => {
        const toggle = document.getElementById('stmui_ggbutton');
        const wasOn = toggle?.checked;
        if (wasOn) toggle.click();
        const style = document.createElement('style');
        style.id = 'test-hostile';
        style.textContent = '#send_form { flex-wrap: nowrap !important; } #nonQRFormItems { display: flex !important; } #send_textarea { order: 9 !important; grid-area: auto !important; }';
        document.head.append(style);
        const row = document.createElement('div');
        row.id = 'gg-action-button-container';
        row.className = 'gg-action-buttons-container';
        row.style.display = 'flex';
        row.innerHTML = '<div class="gg-action-button fa-solid fa-dog"></div><div class="gg-action-button fa-solid fa-forward-fast"></div>';
        const items = document.getElementById('nonQRFormItems');
        items.parentNode.insertBefore(row, items.nextSibling);
        await new Promise(resolve => setTimeout(resolve, 300));
        const form = document.getElementById('send_form').getBoundingClientRect();
        const text = document.getElementById('send_textarea').getBoundingClientRect();
        const send = document.getElementById('send_but').getBoundingClientRect();
        const button = row.querySelector('.gg-action-button').getBoundingClientRect();
        row.remove();
        style.remove();
        if (wasOn) toggle.click();
        return { share: text.width / form.width, ownRow: text.bottom <= send.top + 1, button: Math.min(button.width, button.height) };
    });
    if (result.share < 0.8 || !result.ownRow) throw new Error(`the text was squeezed: ${JSON.stringify(result)}`);
    if (result.button < 44) throw new Error(`the extension's buttons are ${result.button}px`);
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
        const stray = [...document.querySelectorAll('[class*="stmui"], [id^="stmui"], [data-stmui-sec], [data-stmui-row], [data-stmui-view]')].filter(el => !el.closest('#stmui_settings')).length;
        const classes = document.documentElement.className;
        document.getElementById('stmui_enabled').click();
        return { stray, classes };
    });
    if (off.stray || off.classes.includes('stmui')) throw new Error(`left behind: ${off.stray} nodes, classes "${off.classes}"`);
    await until(() => document.documentElement.classList.contains('stmui-on'));
});

await step('desktop layout: tabs as a rail, pages beside the chat that stay open', async () => {
    // Automatic covers computers now: no setting needed. The one-time notice says so.
    await page.evaluate(async () => {
        const context = SillyTavern.getContext();
        context.extensionSettings.mobileUI.desktopNoticeSeen = false;
        context.saveSettingsDebounced();
        await new Promise(resolve => setTimeout(resolve, 2500));
    });
    const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const tab = await desk.newPage();
    tab.on('pageerror', error => {
        if (/Mobile-UI|PocketTavern|stmui/i.test(`${error.stack ?? ''} ${error.message}`)) extensionErrors.push(`desktop: ${error.message}`);
    });
    try {
        await tab.goto(ST_URL, { waitUntil: 'domcontentloaded' });
        await tab.waitForFunction(() => document.documentElement.classList.contains('stmui-wide'), null, { timeout: 120000 });
        await tab.waitForFunction(() => /on here too/.test(document.querySelector('#stmui-sheet')?.textContent ?? ''), null, { timeout: 10000 });
        await tab.evaluate(() => document.querySelector('#stmui-sheet .stmui-done')?.click());
        await tab.waitForTimeout(600);
        const rail = await tab.evaluate(() => { const r = document.querySelector('.stmui-tabbar').getBoundingClientRect(); return { w: r.width, h: r.height }; });
        if (rail.w > 120 || rail.h < 300) throw new Error(`tabs are not a rail: ${JSON.stringify(rail)}`);
        await tab.locator('.stmui-tab[data-tab="ai-config-button"]').click();
        await tab.waitForFunction(() => document.documentElement.dataset.stmuiPage === 'ai-config-button');
        const layout = await tab.evaluate(() => {
            const panel = document.querySelector('#ai-config-button > .drawer-content').getBoundingClientRect();
            const chat = document.getElementById('sheld').getBoundingClientRect();
            return { panelRight: panel.right, panelWidth: panel.width, chatLeft: chat.left };
        });
        if (layout.panelWidth > 520 || layout.chatLeft < layout.panelRight) throw new Error(`page is not a panel beside the chat: ${JSON.stringify(layout)}`);
        await tab.locator('#send_textarea').click();
        await tab.mouse.click(1400, 450);
        await tab.waitForTimeout(400);
        if (await tab.evaluate(() => document.documentElement.dataset.stmuiPage) !== 'ai-config-button') throw new Error('the page closed when the chat was clicked');
        await tab.keyboard.press('Escape');
        await tab.waitForFunction(() => !document.documentElement.dataset.stmuiPage);
        await tab.locator('.stmui-tab[data-tab="more"]').click();
        await tab.waitForFunction(() => !!document.getElementById('stmui-sheet'));
        const box = await tab.evaluate(() => document.querySelector('#stmui-sheet .stmui-panel').getBoundingClientRect());
        if (box.bottom > 880) throw new Error('More is not a centred dialog');
    } finally {
        await desk.close();
    }
});

await step('no errors from Pocket Tavern', async () => {
    if (extensionErrors.length) throw new Error(extensionErrors.join(' | '));
});

await browser.close();
console.log(failed ? `\n${failed} step(s) failed. Screenshots are in tests/results.` : '\nAll steps passed.');
process.exit(failed ? 1 : 0);
