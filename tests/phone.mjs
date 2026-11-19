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
    // The desktop rail's extra pages are in the bar too, hidden on a phone.
    const tabs = await page.locator('.stmui-tab:visible').count();
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

await step("Moonlit Echoes and ScenePulse: their chat styles draw the messages, the box stays clear, ScenePulse opens from Tools", async () => {
    // Stand-ins with the same markup and rules as the real extensions (the test copy has them switched off).
    const barBefore = await page.evaluate(() => document.getElementById('stmui-appbar').getBoundingClientRect().height);
    await page.evaluate(() => {
        const style = document.createElement('style');
        style.id = 'test-ext-standins';
        // Moonlit's rules for the top bar, the chat and the message box, then ScenePulse's for its two buttons and its panel.
        style.textContent = ':root { --topBarBlockSize: 40px !important; }'
            + ' #chat { -webkit-mask-image: linear-gradient(black 80%, transparent); mask-image: linear-gradient(black 80%, transparent); }'
            + ' body.echostyle #chat .mes .mes_text { padding-left: 97px !important; min-height: 200px; }'
            + ' #send_form { opacity: 0.6; } #nonQRFormItems { transition: all 0.8s ease; } #leftSendForm { display: flex; } #leftSendForm > * { display: flex; }'
            + ' #nonQRFormItems #options_button { width: 13px !important; height: 13px !important; }'
            + ' .sp-st-restore { display: flex; width: 34px; height: 34px; padding: 4px; flex-shrink: 0; }'
            + ' .sp-mobile-fab { display: none; position: fixed; bottom: 24px; right: 24px; z-index: 100000; width: 60px; height: 60px; }'
            + ' .sp-mobile-fab.sp-fab-visible { display: flex !important; }'
            + ' #sp-panel { display: none; position: fixed; inset: 44px 0 0 0; z-index: 1000; } #sp-panel.sp-visible { display: flex; }';
        document.head.append(style);
        const fab = document.createElement('button');
        fab.id = 'sp-mobile-fab';
        fab.className = 'sp-mobile-fab sp-fab-visible';
        const panel = document.createElement('div');
        panel.id = 'sp-panel';
        panel.className = 'sp-mode-mobile';
        document.body.append(fab, panel);
        const button = document.createElement('div');
        button.id = 'sp-st-restore';
        button.className = 'sp-st-restore';
        button.style.display = 'flex';
        button.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" class="sp-mascot-pulse"/></svg>';
        button.addEventListener('click', () => panel.classList.add('sp-visible'));
        document.getElementById('rightSendForm').append(button);
    });
    try {
        await page.waitForTimeout(300);
        const bar = await page.evaluate(() => document.getElementById('stmui-appbar').getBoundingClientRect().height);
        if (bar !== barBefore) throw new Error(`a theme changed the top bar from ${barBefore}px to ${bar}px`);
        const box = await page.evaluate(() => {
            const send = document.getElementById('send_but').getBoundingClientRect();
            const at = document.elementFromPoint(send.left + send.width / 2, send.top + send.height / 2);
            const menu = document.getElementById('options_button').getBoundingClientRect();
            return {
                opacity: getComputedStyle(document.getElementById('send_form')).opacity,
                fab: getComputedStyle(document.getElementById('sp-mobile-fab')).display,
                inRow: getComputedStyle(document.getElementById('sp-st-restore')).display,
                send: Math.round(Math.min(send.width, send.height)),
                sendFree: !!at?.closest('#send_but'),
                menu: Math.round(Math.min(menu.width, menu.height)),
            };
        });
        if (box.opacity !== '1') throw new Error(`the message box is faded to ${box.opacity}`);
        if (box.fab !== 'none' || !box.sendFree) throw new Error(`ScenePulse's floating button covers Send: ${JSON.stringify(box)}`);
        if (box.inRow !== 'none' || box.send < 40) throw new Error(`ScenePulse's button crowds the row next to Send: ${JSON.stringify(box)}`);
        if (box.menu < 44) throw new Error(`☰ is ${box.menu}px`);
        // Tools lists ScenePulse; tapping it opens its panel, above the tab bar.
        const pulseRow = () => [...document.querySelectorAll('#stmui-sheet .stmui-menu-row')].find(row => row.textContent.includes('ScenePulse'));
        await page.locator('#extensionsMenuButton').click();
        await until(`(${pulseRow})()`);
        await page.evaluate(`(${pulseRow})().click()`);
        await until(() => document.getElementById('sp-panel').classList.contains('sp-visible'));
        const layer = await page.evaluate(() => [Number(getComputedStyle(document.getElementById('sp-panel')).zIndex), Number(getComputedStyle(document.querySelector('.stmui-tabbar')).zIndex)]);
        if (!(layer[0] > layer[1])) throw new Error(`ScenePulse's panel (z ${layer[0]}) is under the tab bar (z ${layer[1]})`);
        await page.evaluate(() => document.getElementById('sp-panel').classList.remove('sp-visible'));
        // Moonlit's chat styles draw the messages themselves; the tabs arrow still steps aside for the keyboard.
        const looks = await page.evaluate(async () => {
            const card = () => { const s = getComputedStyle(document.querySelector('#chat .mes')); return `${s.borderTopLeftRadius}|${s.paddingTop}|${s.marginTop}`; };
            const cards = card();
            // Read at once: Pocket Tavern's own keyboard check takes the made-up class away again.
            document.documentElement.classList.add('stmui-keyboard');
            const arrow = getComputedStyle(document.querySelector('.stmui-tabs-btn')).display;
            document.documentElement.classList.remove('stmui-keyboard');
            document.body.dataset.testFlat = String(document.body.classList.contains('flatchat'));
            document.body.classList.remove('flatchat');
            document.body.classList.add('echostyle');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { cards, echo: card(), arrow };
        });
        if (looks.arrow !== 'none') throw new Error(`the tabs arrow shows with the keyboard up (${looks.arrow})`);
        if (looks.echo === looks.cards) throw new Error(`the message cards stayed on in Moonlit's Echo style (${looks.cards})`);
        // The editor in Echo, right as it opens: the whole page, Save on top of the faded-out box.
        await page.evaluate(() => [...document.querySelectorAll('#chat .mes')].pop().querySelector('.mes_edit').click());
        await until(() => document.documentElement.classList.contains('stmui-editing'));
        await page.waitForTimeout(150);
        const editor = await page.evaluate(() => {
            const save = document.querySelector('#chat .mes:has(#curEditTextarea) .mes_edit_done').getBoundingClientRect();
            const hit = document.elementFromPoint(save.left + save.width / 2, save.top + save.height / 2);
            return { saveOnTop: !!hit?.closest('.mes_edit_done'), area: document.getElementById('curEditTextarea').getBoundingClientRect().width / innerWidth };
        });
        await page.evaluate(() => document.querySelector('#chat .mes:has(#curEditTextarea) .mes_edit_cancel')?.click());
        await until(() => !document.documentElement.classList.contains('stmui-editing'));
        if (!editor.saveOnTop) throw new Error("the message box covers the editor's Save while it opens");
        if (editor.area < 0.9) throw new Error(`the editor's text field is only ${Math.round(editor.area * 100)}% wide in Echo`);
    } finally {
        await page.evaluate(() => {
            document.documentElement.classList.remove('stmui-keyboard');
            document.body.classList.remove('echostyle');
            if (document.body.dataset.testFlat === 'true') document.body.classList.add('flatchat');
            delete document.body.dataset.testFlat;
            document.getElementById('test-ext-standins')?.remove();
            for (const id of ['sp-mobile-fab', 'sp-panel', 'sp-st-restore']) document.getElementById(id)?.remove();
        });
    }
});

await step('the prompt editor reaches the tabs, opens full screen and asks before unsaved changes are lost; number boxes show the whole number', async () => {
    const api = await page.evaluate(() => document.getElementById('main_api').value);
    const setApi = want => page.evaluate(value => {
        const select = document.getElementById('main_api');
        if (select.value === value) return;
        select.value = value;
        select.dispatchEvent(new Event('change'));
    }, want);
    try {
        await setApi('openai');
        await page.waitForTimeout(800);
        await showTabs();
        await page.locator('.stmui-tab[data-tab="ai-config-button"]').click();
        await until(() => document.documentElement.dataset.stmuiPage === 'ai-config-button');
        await until(() => !!document.querySelector('#completion_prompt_manager_list .prompt-manager-edit-action'), null, 15000);
        // Beside − and +: no browser arrows over the number (Firefox always shows them), and room for seven digits.
        const box = await page.evaluate(() => {
            const input = [...document.querySelectorAll('#ai-config-button .range-block-counter.stmui-stepper input[type="number"]')].find(box => box.getClientRects().length);
            const style = getComputedStyle(input);
            const measure = document.createElement('canvas').getContext('2d');
            measure.font = style.font;
            return { appearance: style.appearance, room: input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight), need: Math.ceil(measure.measureText('1000000').width) };
        });
        if (box.appearance !== 'textfield' || box.room < box.need) throw new Error(`number box: ${JSON.stringify(box)}`);
        // Chat Completion Tabs (a stand-in when it is not installed): its tabs are 44px.
        const tabHeight = await page.evaluate(() => {
            let bar = document.querySelector('#ai-config-button .openai-tab-buttons');
            const made = !bar;
            if (made) {
                bar = document.createElement('div');
                bar.className = 'openai-tab-buttons';
                bar.innerHTML = '<button class="openai-tab-button active">Parameters</button><button class="openai-tab-button">Prompts</button>';
                (document.getElementById('openai_api-presets') ?? document.getElementById('left-nav-panel')).append(bar);
            }
            const height = Math.round(bar.querySelector('.openai-tab-button').getBoundingClientRect().height);
            if (made) bar.remove();
            else document.getElementById('openai-tab-btn-prompts')?.click();
            return height;
        });
        if (tabHeight < 44) throw new Error(`the Parameters and Prompts tabs are ${tabHeight}px`);
        const edit = page.locator('#completion_prompt_manager_list .prompt-manager-edit-action').first();
        await edit.scrollIntoViewIfNeeded();
        await edit.click();
        await until(() => document.documentElement.classList.contains('stmui-prompt-editor'));
        await page.waitForTimeout(600);
        // SillyTavern stops its drawers 50px short of the bottom; the editor is a page and reaches the tabs.
        const fit = await page.evaluate(() => ({
            bottom: Math.round(document.getElementById('completion_prompt_manager_popup').getBoundingClientRect().bottom),
            tabs: Math.round(document.getElementById('stmui-tabbar').getBoundingClientRect().top),
        }));
        if (Math.abs(fit.bottom - fit.tabs) > 2) throw new Error(`the editor ends at ${fit.bottom}px, the tabs start at ${fit.tabs}px`);
        // Full screen: the prompt text gets the page, and back leaves full screen, not the editor.
        await page.locator('#stmui_prompt_full').click();
        await until(() => document.documentElement.classList.contains('stmui-prompt-full'));
        const full = await page.evaluate(() => ({
            fields: getComputedStyle(document.querySelector('#completion_prompt_manager_popup_edit .completion_prompt_manager_popup_entry_form > .flex-container')).display,
            text: Math.round(document.getElementById('completion_prompt_manager_popup_entry_form_prompt').getBoundingClientRect().height),
        }));
        if (full.fields !== 'none' || full.text < 400) throw new Error(`full screen: ${JSON.stringify(full)}`);
        await page.waitForTimeout(400);
        await page.goBack();
        await until(() => !document.documentElement.classList.contains('stmui-prompt-full'));
        await page.waitForTimeout(500);
        if (!(await page.evaluate(() => document.documentElement.classList.contains('stmui-prompt-editor')))) throw new Error('back closed the editor instead of leaving full screen');
        // A change, then another tab: it asks. Keep editing stays; Discard changes goes on.
        const prompt = page.locator('#completion_prompt_manager_popup_entry_form_prompt');
        await prompt.tap();
        await prompt.press('End');
        await page.keyboard.type(' (test)');
        await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="rightNavHolder"]').click());
        await until(() => /without saving/.test(document.querySelector('#stmui-sheet')?.textContent ?? ''));
        await page.locator('#stmui-sheet .stmui-action-row', { hasText: 'Keep editing' }).click();
        await until(() => !document.getElementById('stmui-sheet'));
        await page.waitForTimeout(300);
        if (await page.evaluate(() => document.documentElement.dataset.stmuiPage) !== 'ai-config-button') throw new Error('Keep editing left the editor');
        await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="rightNavHolder"]').click());
        await until(() => !!document.getElementById('stmui-sheet'));
        await page.locator('#stmui-sheet .stmui-action-row', { hasText: 'Discard changes' }).click();
        await until(() => document.documentElement.dataset.stmuiPage === 'rightNavHolder');
        await until(() => document.getElementById('completion_prompt_manager_popup').style.display === 'none');
    } finally {
        if (await page.locator('#stmui-sheet').count()) await closeSheet();
        await setApi(api);
        // SillyTavern saves a second later; the desktop step reloads the settings.
        await page.waitForTimeout(1500);
        await page.evaluate(() => document.querySelector('.stmui-tab[data-tab="chat"]')?.click());
        await page.waitForTimeout(400);
    }
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

await step('desktop layout: a rail with every page, a panel that stays open and can be widened, a prompt editor that fills it', async () => {
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
        await tab.keyboard.press('Escape');
        // ScenePulse's side panel (it sets its own top from SillyTavern's hidden top bar) and Moonlit's rule that shows every tool.
        const side = await tab.evaluate(async () => {
            const style = document.createElement('style');
            style.textContent = '#leftSendForm > * { display: flex; }';
            document.head.append(style);
            const panel = document.createElement('div');
            panel.id = 'sp-panel';
            panel.className = 'sp-visible';
            panel.style.cssText = 'position: fixed; top: 1px; right: 0; bottom: 0; width: 280px; z-index: 1000;';
            document.body.append(panel);
            await new Promise(resolve => setTimeout(resolve, 100));
            const out = {
                top: Math.round(panel.getBoundingClientRect().top),
                bar: Math.round(document.getElementById('stmui-appbar').getBoundingClientRect().bottom),
                arrow: getComputedStyle(document.querySelector('.stmui-tabs-btn')).display,
            };
            panel.remove();
            style.remove();
            return out;
        });
        if (side.top < side.bar) throw new Error(`ScenePulse's panel starts at ${side.top}px, under the top bar (${side.bar}px)`);
        if (side.arrow !== 'none') throw new Error(`the tabs arrow shows in the desktop layout (${side.arrow})`);
        // The rail lists SillyTavern's other pages too, the pill follows, and More does not repeat them.
        const railTabs = await tab.locator('.stmui-tab:visible').count();
        if (railTabs < 10) throw new Error(`the rail shows ${railTabs} tabs`);
        await tab.locator('.stmui-tab[data-tab="user-settings-button"]').click();
        await tab.waitForFunction(() => document.documentElement.dataset.stmuiPage === 'user-settings-button');
        await tab.waitForTimeout(800);
        const pill = await tab.evaluate(() => ({
            pill: Math.round(document.querySelector('.stmui-tab-indicator').getBoundingClientRect().top),
            icon: Math.round(document.querySelector('.stmui-tab[data-tab="user-settings-button"] .stmui-tab-icon').getBoundingClientRect().top),
        }));
        if (Math.abs(pill.pill - pill.icon) > 2) throw new Error(`the rail's pill is not on Settings: ${JSON.stringify(pill)}`);
        // The panel's edge drags it wider, the width is kept, and a double-click puts it back.
        const widthOf = () => tab.evaluate(() => Math.round(document.querySelector('#user-settings-button > .drawer-content').getBoundingClientRect().width));
        const edge = await tab.evaluate(() => {
            const rect = document.getElementById('stmui-panel-edge').getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + 300 };
        });
        const start = await widthOf();
        await tab.mouse.move(edge.x, edge.y);
        await tab.mouse.down();
        await tab.mouse.move(edge.x + 150, edge.y, { steps: 6 });
        await tab.mouse.up();
        await tab.waitForTimeout(300);
        const wider = await widthOf();
        const kept = await tab.evaluate(() => localStorage.getItem('stmui_panel_w'));
        if (wider - start < 140 || Number(kept) !== wider) throw new Error(`dragging the edge: ${start}px to ${wider}px, kept "${kept}"`);
        await tab.mouse.dblclick(edge.x + 150, edge.y);
        await tab.waitForTimeout(300);
        if (Math.abs(await widthOf() - start) > 1 || await tab.evaluate(() => localStorage.getItem('stmui_panel_w'))) throw new Error('a double-click on the edge did not reset the panel');
        // Extensions: one column in the panel.
        await tab.locator('.stmui-tab[data-tab="extensions-settings-button"]').click();
        await tab.waitForFunction(() => document.documentElement.dataset.stmuiPage === 'extensions-settings-button');
        await tab.waitForTimeout(600);
        const columns = await tab.evaluate(() => [document.getElementById('extensions_settings'), document.getElementById('extensions_settings2')].map(node => Math.round(node.getBoundingClientRect().left)));
        if (columns[0] !== columns[1]) throw new Error(`the Extensions page has two columns: ${columns}`);
        await tab.locator('.stmui-tab[data-tab="more"]').click();
        await tab.waitForFunction(() => !!document.getElementById('stmui-sheet'));
        const tiles = await tab.locator('#stmui-sheet .stmui-tile-label').allInnerTexts();
        if (tiles.some(label => ['API', 'Settings', 'Extensions', 'Personas'].includes(label.trim()))) throw new Error(`More repeats the rail: ${tiles}`);
        await tab.keyboard.press('Escape');
        await tab.waitForFunction(() => !document.getElementById('stmui-sheet'));
        await tab.keyboard.press('Escape');
        await tab.waitForFunction(() => !document.documentElement.dataset.stmuiPage);
        // A laptop window with browser bars: More still fits on the rail.
        await tab.setViewportSize({ width: 1280, height: 620 });
        await tab.waitForTimeout(500);
        const short = await tab.evaluate(() => ({
            more: Math.round(document.querySelector('.stmui-tab[data-tab="more"]').getBoundingClientRect().bottom),
            rail: Math.round(document.getElementById('stmui-tabbar').getBoundingClientRect().bottom),
        }));
        if (short.more > short.rail) throw new Error(`More is cut off at 620px tall: ${JSON.stringify(short)}`);
        await tab.setViewportSize({ width: 1440, height: 900 });
        await tab.waitForTimeout(500);
        // The prompt editor fills the panel to the bottom, full screen takes the width, and Escape leaves it step by step.
        const api = await tab.evaluate(() => document.getElementById('main_api').value);
        const setApi = want => tab.evaluate(value => {
            const select = document.getElementById('main_api');
            if (select.value === value) return;
            select.value = value;
            select.dispatchEvent(new Event('change'));
        }, want);
        try {
            await setApi('openai');
            await tab.waitForTimeout(800);
            await tab.locator('.stmui-tab[data-tab="ai-config-button"]').click();
            await tab.waitForFunction(() => !!document.querySelector('#completion_prompt_manager_list .prompt-manager-edit-action'), null, { timeout: 15000 });
            await tab.evaluate(() => document.getElementById('openai-tab-btn-prompts')?.click());
            const edit = tab.locator('#completion_prompt_manager_list .prompt-manager-edit-action').first();
            await edit.scrollIntoViewIfNeeded();
            await edit.click();
            await tab.waitForFunction(() => document.documentElement.classList.contains('stmui-prompt-editor'));
            await tab.waitForTimeout(600);
            const editor = await tab.evaluate(() => ({
                bottom: Math.round(document.getElementById('completion_prompt_manager_popup').getBoundingClientRect().bottom),
                width: Math.round(document.getElementById('completion_prompt_manager_popup').getBoundingClientRect().width),
                panel: Math.round(document.querySelector('#ai-config-button > .drawer-content').getBoundingClientRect().width),
                screen: innerHeight,
            }));
            if (editor.bottom !== editor.screen || editor.width !== editor.panel) throw new Error(`the prompt editor does not fill the panel: ${JSON.stringify(editor)}`);
            await tab.locator('#stmui_prompt_full').click();
            await tab.waitForTimeout(400);
            const fullWidth = await tab.evaluate(() => Math.round(document.getElementById('completion_prompt_manager_popup').getBoundingClientRect().width));
            if (fullWidth < 1200) throw new Error(`full screen is ${fullWidth}px wide`);
            await tab.keyboard.press('Escape');
            await tab.waitForFunction(() => !document.documentElement.classList.contains('stmui-prompt-full'));
            await tab.keyboard.press('Escape');
            await tab.waitForFunction(() => document.getElementById('completion_prompt_manager_popup').style.display === 'none');
        } finally {
            await setApi(api);
            // SillyTavern saves a second later; wait, or closing the window loses the change.
            await tab.waitForTimeout(2000);
        }
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
