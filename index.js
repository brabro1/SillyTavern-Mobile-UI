/**
 * Pocket Tavern for SillyTavern
 *
 * Turns SillyTavern on a phone into an app-style interface: a top app bar, a
 * bottom tab bar, full-screen pages that the Android back gesture closes, a
 * restyled chat, and touch-first controls everywhere.
 *
 * Everything is scoped behind classes on <html> (`stmui-on` and feature
 * classes). Removing them, or disabling the extension, restores the stock
 * interface. Nothing is moved out of SillyTavern's own DOM: the app bar and tab
 * bar only click SillyTavern's existing drawer toggles.
 *
 * The lorebook pickers never replace SillyTavern's own <select> elements. They
 * hide them, then read from and write to them, dispatching a normal `change`
 * event, so SillyTavern applies selections exactly as it does today.
 */

import { svgIcon, iconCss, iconUrl } from './icons.js';
import { THEMES, findTheme, themeCss } from './themes.js';
import { t, setLocale, isRtl } from './i18n.js';
import './locales.js';
import { CHANGES, VERSION } from './changelog.js';

const MODULE = 'mobileUI';
const MODE_KEY = 'stmui_mode';
const LOG = '[Pocket Tavern]';

const DEFAULTS = Object.freeze({
    enabled: true,
    appShell: true,
    chatStyle: true,
    touchSizing: true,
    backGesture: true,
    lorebookPicker: true,
    longSelects: false,
    wandShortcut: true,
    theme: 'st',
    themeBackdrop: true,
    modernFont: true,
    customIcons: true,
    /** 'full' | 'light' | 'off' */
    motion: 'full',
    /** 'small' | 'normal' | 'large' | 'xl' */
    textSize: 'normal',
    sendEffect: true,
    haptics: true,
    jumpButton: true,
    messageMenu: true,
    saveDrafts: true,
    keepAwake: true,
    imageViewer: true,
    niceToasts: true,
    longPress: true,
    serverWatch: true,
    fastChat: true,
    lastSeenVersion: '',
    recentLanguages: [],
    autoTranslate: false,
    charPage: true,
    dragSwipe: true,
    foldLong: true,
    contextMeter: true,
    chatLook: 'cards',
    loreCards: true,
    sharpPictures: true,
    animatedPictures: true,
    recentTools: true,
    /** 'auto' (compact on small phones) | 'comfortable' | 'compact' */
    uiSize: 'auto',
    /** 'floating' | 'docked' */
    composerStyle: 'floating',
    /** In a chat the bottom tabs tuck away; a button in the message box brings them back. */
    hideTabsInChat: true,
    desktopNoticeSeen: false,
});

const SIZES = { auto: 'Automatic', comfortable: 'Comfortable', compact: 'Compact' };
const SIZE_NOTES = {
    auto: 'Compact on small phones, comfortable on the rest.',
    comfortable: 'Roomy cards and bars.',
    compact: 'Slimmer bars and tighter cards, so more of the chat fits.',
};
const COMPOSER_STYLES = { floating: 'Floating', docked: 'Docked' };
const COMPOSER_NOTES = {
    floating: 'The message box floats over the chat.',
    docked: 'The message box sits flat along the bottom edge, like a messaging app.',
};

const TEXT_SIZES = { small: 'Small', normal: 'Normal', large: 'Large', xl: 'Extra large' };

/** Phone features shown as switches in More → Phone features and in the settings panel. */
const EXTRAS = [
    { key: 'hideTabsInChat', id: 'stmui_tucktabs', label: 'Hide tabs in a chat', hint: 'More room for the chat, and no tabs right under the message box. Tap the arrow in the message box to show them.' },
    { key: 'messageMenu', id: 'stmui_msgmenu', label: 'Message menu', hint: 'Tap ⋯ on a message for a full list of actions with names.' },
    { key: 'dragSwipe', id: 'stmui_dragswipe', label: 'Drag to swipe', hint: 'Drag the last reply left for another version, right for the previous one.' },
    { key: 'foldLong', id: 'stmui_foldlong', label: 'Fold long messages', hint: 'Very long older messages get a Show more button.' },
    { key: 'contextMeter', id: 'stmui_meter', label: 'Context ring', hint: 'A ring in the message box shows how full the context is. Tap it for the details.' },
    { key: 'loreCards', id: 'stmui_lorecards', label: 'Lorebook entry cards', hint: 'Entries as cards with keyword chips; an opened entry fills the page.' },
    { key: 'sharpPictures', id: 'stmui_sharp', label: 'Sharp character pictures', hint: 'Shows the full-quality picture instead of the small thumbnail, sized for your screen.' },
    { key: 'animatedPictures', id: 'stmui_gifs', label: 'Animated pictures', hint: 'Pick a GIF or animated WebP as a character picture and it moves everywhere.' },
    { key: 'charPage', id: 'stmui_charpage', label: 'New character pages', hint: 'Big avatar, labeled tools and tabs on character cards; names under favorites; an A–Z strip on the list.' },
    { key: 'recentTools', id: 'stmui_recenttools', label: 'Chat list helpers', hint: 'Search and swipe in Recent chats; chat history grouped by date.' },
    { key: 'longPress', id: 'stmui_longpress', label: 'Long-press for message menu', hint: 'Hold a message for its menu. Turn off if you prefer long-press to select text.' },
    { key: 'serverWatch', id: 'stmui_server', label: 'Connection check', hint: 'Shows a banner when SillyTavern stops answering, for example when Termux was closed.' },
    { key: 'fastChat', id: 'stmui_fastchat', label: 'Faster long chats', hint: 'Skips drawing messages far off screen, so long chats scroll smoothly.' },
    { key: 'jumpButton', id: 'stmui_jump', label: 'Jump to latest', hint: 'A button that takes you back to the newest message.' },
    { key: 'saveDrafts', id: 'stmui_drafts', label: 'Keep unsent messages', hint: 'What you type is kept for each chat, even if the browser reloads.' },
    { key: 'keepAwake', id: 'stmui_awake', label: 'Keep screen on while replying', hint: 'The screen stays on until the reply is finished.' },
    { key: 'imageViewer', id: 'stmui_viewer', label: 'Picture viewer', hint: 'Tap an avatar in the chat to see it full screen. Pinch or double-tap to zoom.' },
    { key: 'niceToasts', id: 'stmui_toasts', label: 'Nicer notifications', hint: 'Cards with an icon and color; swipe one sideways to dismiss it.' },
    { key: 'sendEffect', id: 'stmui_sendfx', label: 'Send animation', hint: 'A little launch effect when you send.' },
    { key: 'haptics', id: 'stmui_haptics', label: 'Vibration', hint: 'A short buzz on send and tab taps (Android).' },
];

const MOTION_LABELS = {
    full: 'Smooth: animations and glass effects',
    light: 'Light: quick fades, no blur (faster)',
    off: 'Off: no animations (fastest)',
};

/** Selects that get the lorebook picker. `kind` mirrors the underlying control. */
const LOREBOOK_TARGETS = [
    {
        selector: '#world_info',
        kind: 'multi',
        title: 'Active lorebooks',
        subtitle: 'Global: applies to every chat',
        emptyLabel: 'No lorebooks active',
        buttonLabel: 'Choose lorebooks',
        editable: true,
        badges: true,
    },
    {
        selector: '.character_world_info_selector',
        kind: 'single',
        title: 'Primary lorebook',
        subtitle: 'Linked to this character and exported with the card',
        noneLabel: 'None',
        context: 'character',
        clearable: true,
    },
    {
        selector: '.character_extra_world_info_selector',
        kind: 'multi',
        title: 'Additional lorebooks',
        subtitle: 'Linked to this character, not exported with the card',
        emptyLabel: 'No additional lorebooks',
        buttonLabel: 'Choose lorebooks',
        context: 'character',
    },
    {
        selector: '.chat_world_info_selector',
        kind: 'single',
        title: 'Chat lorebook',
        subtitle: 'Bound to this chat only',
        noneLabel: 'None',
        clearable: true,
    },
    {
        selector: '.persona_world_info_selector',
        kind: 'single',
        title: 'Persona lorebook',
        subtitle: 'Linked to your active persona',
        noneLabel: 'None',
        clearable: true,
    },
    {
        selector: '#world_editor_select',
        kind: 'single',
        title: 'Open lorebook',
        subtitle: 'Pick a lorebook to view and edit',
        noneLabel: 'Close editor',
        placeholder: 'Pick a lorebook to edit',
    },
];

/** SillyTavern's top-bar drawers, keyed by the id of their `.drawer` element. Icons come from icons.js. */
const PAGES = {
    'ai-config-button': { title: 'Presets', long: 'AI response settings', icon: 'sliders' },
    'sys-settings-button': { title: 'API', long: 'API connection', icon: 'plug' },
    'advanced-formatting-button': { title: 'Formatting', long: 'Prompt formatting', icon: 'type' },
    'WI-SP-button': { title: 'Lorebooks', long: 'Lorebooks and World Info', icon: 'book' },
    'user-settings-button': { title: 'Settings', long: 'User settings', icon: 'settings' },
    'backgrounds-button': { title: 'Backgrounds', long: 'Chat backgrounds', icon: 'image' },
    'extensions-settings-button': { title: 'Extensions', long: 'Extensions and add-ons', icon: 'puzzle' },
    'persona-management-button': { title: 'Personas', long: 'Who you are in the chat', icon: 'smile' },
    'rightNavHolder': { title: 'Characters', long: 'Characters and groups', icon: 'users' },
};

/** Subtitles on the More tiles, only where they add information. */
const TILE_NOTES = {
    'persona-management-button': 'Who you are in the chat',
};

const TABS = [
    { id: 'chat', label: 'Chat', icon: 'chat' },
    { id: 'rightNavHolder', label: 'Characters', icon: 'users' },
    { id: 'WI-SP-button', label: 'Lorebooks', icon: 'book' },
    { id: 'ai-config-button', label: 'Presets', icon: 'sliders' },
    { id: 'more', label: 'More', icon: 'grid' },
];

/** Order of the tiles in the "More" sheet; drawers added by other extensions follow. */
const MORE_ORDER = [
    'sys-settings-button',
    'persona-management-button',
    'advanced-formatting-button',
    'user-settings-button',
    'backgrounds-button',
    'extensions-settings-button',
];

const LONG_SELECT_MIN_OPTIONS = 14;
/** Visible height (px) below which the sheet drops secondary chrome: landscape or keyboard open. */
const COMPACT_BELOW = 520;
/**
 * Wide screens (a computer, a tablet held sideways) get the desktop layout: tabs
 * as a rail on the left, pages as a panel beside the chat, sheets as dialogs.
 * A sideways phone is wide but short, so it keeps the phone layout.
 */
const WIDE_QUERY = '(min-width: 960px) and (min-height: 560px)';
/** Phones narrower than this (most 360px Androids, foldable cover screens) get the compact size on Automatic. */
const SMALL_PHONE_BELOW = 380;
const LONG_SELECT_EXCLUDE = '.stmui-native-hidden, .template_element select, #stmui-sheet select, .select2-hidden-accessible, select[multiple]';

/** @type {Map<HTMLSelectElement, Picker>} */
const pickers = new Map();
let settings = null;
let active = false;
let sheet = null;
let scanTimer = 0;
let domObserver = null;

// ---------------------------------------------------------------- utilities

function ctx() {
    return globalThis.SillyTavern.getContext();
}

function $j() {
    return globalThis.jQuery;
}

/**
 * Tiny DOM builder.
 * @param {string} tag
 * @param {Record<string, any>} [attrs]
 * @param {Array<Node|string|null|false>} [children]
 */
function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (value === false || value === null || value === undefined) continue;
        if (key === 'class') el.className = value;
        // Labels go through the translator; text without a translation stays as it is.
        else if (key === 'text') el.textContent = typeof value === 'string' ? t(value) : value;
        else if (key === 'title' || key === 'aria-label' || key === 'placeholder') el.setAttribute(key, t(String(value)));
        else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
        else el.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children) {
        if (child === null || child === false || child === undefined) continue;
        el.append(typeof child === 'string' ? t(child) : child);
    }
    return el;
}

const icon = (classes) => h('i', { class: `fa-solid ${classes}`, 'aria-hidden': 'true' });
/** Our own line icon (icons.js), or a Font Awesome class for drawers we do not know. */
const ui = (name, className = '') => (name.startsWith('fa-') ? icon(`${name} ${className}`) : svgIcon(name, className));

function normalizeText(text) {
    return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Builds a node list with every match of `query` wrapped in <mark>. */
function highlight(text, query) {
    const q = normalizeText(query.trim());
    const norm = normalizeText(text);
    if (!q || norm.length !== text.length) return [text];
    const nodes = [];
    let cursor = 0;
    let at = norm.indexOf(q, cursor);
    while (at !== -1) {
        if (at > cursor) nodes.push(text.slice(cursor, at));
        nodes.push(h('mark', { text: text.slice(at, at + q.length) }));
        cursor = at + q.length;
        at = norm.indexOf(q, cursor);
    }
    if (cursor < text.length) nodes.push(text.slice(cursor));
    return nodes;
}

/** Keeps SillyTavern's "close drawers on outside tap" handler away from our own chrome. */
function shieldFromDrawerAutoClose(element) {
    for (const type of ['mousedown', 'touchstart']) {
        element.addEventListener(type, event => event.stopPropagation(), { passive: true });
    }
}

function readMode() {
    try {
        const value = localStorage.getItem(MODE_KEY);
        // "always" was the old way to use it on a computer; automatic does that now.
        return value === 'phone' || value === 'never' ? value : 'auto';
    } catch {
        return 'auto';
    }
}

function writeMode(mode) {
    try {
        localStorage.setItem(MODE_KEY, mode);
    } catch (error) {
        console.warn(LOG, 'Could not store the activation mode', error);
    }
}

function loadSettings() {
    const { extensionSettings } = ctx();
    extensionSettings[MODULE] = Object.assign({}, DEFAULTS, extensionSettings[MODULE]);
    settings = extensionSettings[MODULE];
}

function saveSettings() {
    ctx().saveSettingsDebounced();
}

// ------------------------------------------------------- phone detection

/** Best-effort phone check that survives Chrome's "Desktop site" mode. */
function detectPhone() {
    const coarse = matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches;
    const sides = [screen.width, screen.height].filter(n => n > 0);
    const shortSide = sides.length ? Math.min(...sides) : Infinity;
    const uaPhone = /Android.+Mobile|iPhone|iPod/i.test(navigator.userAgent);
    return (coarse && shortSide <= 500) || uaPhone;
}

/**
 * Automatic means on everywhere: phones get the phone layout and wide screens
 * the desktop layout. "Phones only" keeps a computer on the original interface.
 */
function shouldBeActive() {
    if (!settings.enabled) return false;
    const mode = readMode();
    if (mode === 'never') return false;
    if (mode === 'phone') return detectPhone();
    return true;
}

// ------------------------------------------------------------ picker model

/**
 * @typedef {{ index: number, value: string, text: string, selected: boolean, isNone: boolean }} Item
 */

class Picker {
    /**
     * @param {HTMLSelectElement} select
     * @param {typeof LOREBOOK_TARGETS[number]} config
     */
    constructor(select, config) {
        this.select = select;
        this.config = config;
        this.multi = config.kind === 'multi';
        this.isLong = config.selector === '*';
        this.root = null;
        this.optionObserver = null;
        this.onChange = () => this.render();
        this.build();
    }

    build() {
        const { select } = this;
        this.root = h('div', { class: `stmui-picker ${this.multi ? 'stmui-picker-multi' : 'stmui-picker-single'}`, 'data-stmui': '1' });
        const anchor = select.nextElementSibling?.classList.contains('select2') ? select.nextElementSibling : select;
        anchor.after(this.root);
        select.classList.add('stmui-native-hidden');
        $j()(select).on('change.stmui', this.onChange);
        this.optionObserver = new MutationObserver(() => this.render());
        this.optionObserver.observe(select, { childList: true, subtree: true, characterData: true });
        this.render();
    }

    destroy() {
        $j()(this.select).off('change.stmui', this.onChange);
        this.optionObserver?.disconnect();
        this.root?.remove();
        this.select.classList.remove('stmui-native-hidden');
        if (sheet?.picker === this) closeSheet();
    }

    /** @returns {Item[]} */
    items() {
        return Array.from(this.select.options).map((option, index) => {
            const isNone = option.value === '';
            return {
                index,
                value: option.value,
                text: this.cleanText(option, isNone),
                selected: option.selected,
                isNone,
            };
        }).filter(item => !(this.multi && item.isNone));
    }

    cleanText(option, isNone) {
        const raw = (option.textContent ?? '').trim();
        if (!isNone) return raw;
        return this.config.noneLabel ?? (raw.replace(/^[-–—\s]+|[-–—\s]+$/g, '') || 'None');
    }

    get title() {
        const scope = this.select.closest('.character_world');
        const name = scope?.querySelector('.character_name')?.textContent?.trim();
        return name && this.config.context === 'character' ? `${this.config.title} · ${name}` : this.config.title;
    }

    selectedItems() {
        return this.items().filter(item => item.selected && !item.isNone);
    }

    realBookCount() {
        return this.items().filter(item => !item.isNone).length;
    }

    /** Applies a selection through the original control. */
    commit(index, selected) {
        const option = this.select.options[index];
        if (!option) return;
        if (this.multi) {
            option.selected = selected;
        } else {
            this.select.selectedIndex = index;
        }
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    clearAll() {
        let changed = false;
        for (const option of this.select.options) {
            if (option.selected) {
                option.selected = false;
                changed = true;
            }
        }
        if (changed) this.select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    render() {
        if (!this.root) return;
        const root = this.root;
        root.replaceChildren();
        const items = this.items();
        const selected = items.filter(item => item.selected && !item.isNone);
        const total = items.filter(item => !item.isNone).length;

        if (this.multi) {
            root.append(this.renderChips(selected));
            const open = h('button', {
                type: 'button',
                class: 'stmui-open menu_button',
                onclick: () => openSheet(this),
            }, [
                icon('fa-book-atlas'),
                h('span', { class: 'stmui-open-label', text: this.config.buttonLabel ?? 'Choose' }),
                h('span', { class: 'stmui-count', text: total ? `${selected.length}/${total}` : '0' }),
            ]);
            root.append(open);
        } else {
            const current = selected[0] ?? null;
            const hasValue = !!current;
            const label = hasValue ? current.text : (this.config.placeholder ?? this.config.noneLabel ?? 'None');
            const button = h('button', {
                type: 'button',
                class: `stmui-single text_pole ${hasValue ? '' : 'stmui-single-empty'}`,
                'aria-haspopup': 'dialog',
                onclick: () => openSheet(this),
            }, [
                h('span', { class: 'stmui-single-label', text: label }),
                icon('fa-chevron-down stmui-chevron'),
            ]);
            root.append(button);
            if (hasValue && this.config.clearable && items.some(item => item.isNone)) {
                root.append(h('button', {
                    type: 'button',
                    class: 'stmui-clear menu_button',
                    'aria-label': `Remove ${current.text}`,
                    title: 'Remove',
                    onclick: () => {
                        const none = items.find(item => item.isNone);
                        if (none) this.commit(none.index, true);
                    },
                }, [icon('fa-xmark')]));
            }
        }
        if (sheet?.picker === this) sheet.refresh();
    }

    renderChips(selected) {
        const wrap = h('div', { class: 'stmui-chips' });
        if (!selected.length) {
            wrap.append(h('span', { class: 'stmui-chips-empty', text: this.config.emptyLabel ?? 'Nothing selected' }));
            return wrap;
        }
        const visible = selected.slice(0, 8);
        for (const item of visible) {
            wrap.append(h('span', { class: 'stmui-chip' }, [
                h('span', { class: 'stmui-chip-text', text: item.text }),
                h('button', {
                    type: 'button',
                    class: 'stmui-chip-x',
                    'aria-label': `Remove ${item.text}`,
                    onclick: () => this.commit(item.index, false),
                }, [icon('fa-xmark')]),
            ]));
        }
        if (selected.length > visible.length) {
            wrap.append(h('button', {
                type: 'button',
                class: 'stmui-chip stmui-chip-more',
                onclick: () => openSheet(this, { filter: 'selected' }),
                text: `+${selected.length - visible.length} more`,
            }));
        }
        return wrap;
    }
}

// ------------------------------------------------------------------ sheets

/** Grab handle, title, subtitle and the close button shared by every sheet. */
function buildSheetHead(target, title, subtitle, doneLabel) {
    target.title = h('h3', { class: 'stmui-title', text: title });
    target.subtitle = h('p', { class: 'stmui-subtitle', text: subtitle ?? '' });
    const done = h('button', { type: 'button', class: 'stmui-done menu_button', onclick: () => closeSheet() }, [doneLabel]);
    target.head = h('div', { class: 'stmui-head' }, [
        h('div', { class: 'stmui-grab', 'aria-hidden': 'true' }),
        h('div', { class: 'stmui-head-row' }, [
            h('div', { class: 'stmui-head-text' }, [target.title, target.subtitle]),
            done,
        ]),
    ]);
    return target.head;
}

/** Backdrop tap, Escape, swipe-down and drawer shielding, shared by every sheet. */
function wireSheet(target) {
    const { dialog, panel, head } = target;
    dialog.addEventListener('click', event => {
        if (event.target === dialog) closeSheet();
    });
    // SillyTavern closes unpinned drawers on any mousedown/touchstart outside them.
    // The sheet lives outside the drawer, so keep those events from reaching <html>.
    shieldFromDrawerAutoClose(dialog);
    dialog.addEventListener('cancel', event => {
        event.preventDefault();
        closeSheet();
    });

    // Drag down to close: from the top strip, or from the contents when they are
    // scrolled to the top. The sheet is its own layer while dragging and moves once
    // per frame, and nothing else changes meanwhile (restyling the dimmed
    // background each frame made a slow drag stutter). The listeners never block
    // the browser's own scrolling. A quick flick closes.
    let startY = null;
    let lastY = 0;
    let lastT = 0;
    let speed = 0;
    let dy = 0;
    let dragging = false;
    let frame = 0;
    const paint = () => {
        frame = 0;
        panel.style.transform = `translate3d(0, ${dy}px, 0)`;
    };
    const begin = event => {
        // Rows and buttons can start a drag too (most of a sheet is rows); fields cannot.
        if (event.touches.length !== 1 || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
        startY = lastY = event.touches[0].clientY;
        lastT = event.timeStamp;
        speed = 0;
        dy = 0;
        dragging = false;
    };
    const move = event => {
        if (startY === null) return;
        const y = event.touches[0].clientY;
        if (!dragging) {
            // From the contents, only a downward pull at the very top drags; anything else scrolls.
            const body = event.currentTarget === head ? null : event.currentTarget;
            if (y - startY < 6 || (body && body.scrollTop > 0)) {
                if (body && (y - startY < -6 || body.scrollTop > 0)) startY = null;
                return;
            }
            dragging = true;
            startY = y;
            panel.style.transition = 'none';
            panel.style.willChange = 'transform';
        }
        const dt = Math.max(1, event.timeStamp - lastT);
        speed = (y - lastY) / dt;
        lastY = y;
        lastT = event.timeStamp;
        dy = Math.max(0, y - startY);
        if (!frame) frame = requestAnimationFrame(paint);
    };
    const end = () => {
        if (startY === null) return;
        startY = null;
        if (!dragging) return;
        dragging = false;
        cancelAnimationFrame(frame);
        frame = 0;
        // A drag that started on a row must not also press it.
        const swallow = click => {
            click.preventDefault();
            click.stopPropagation();
        };
        dialog.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => dialog.removeEventListener('click', swallow, { capture: true }), 400);
        panel.style.transition = '';
        panel.style.willChange = '';
        // Pulled far enough, or flicked down: keep going from where the finger let go.
        if (dy > 90 || speed > 0.55) {
            panel.style.transform = 'translateY(100%)';
            closeSheet();
        } else panel.style.transform = '';
    };
    for (const area of [head, target.body ?? target.list].filter(Boolean)) {
        area.addEventListener('touchstart', begin, { passive: true });
        area.addEventListener('touchmove', move, { passive: true });
        area.addEventListener('touchend', end);
        area.addEventListener('touchcancel', end);
    }
}

class Sheet {
    /**
     * @param {Picker} picker
     * @param {{filter?: 'all'|'selected'}} [options]
     */
    constructor(picker, options = {}) {
        this.picker = picker;
        this.query = '';
        this.filter = options.filter ?? 'all';
        this.closing = false;
        this.build();
    }

    build() {
        const { picker } = this;
        this.dialog = h('dialog', { id: 'stmui-sheet', class: 'stmui-sheet', 'aria-label': picker.title });
        this.panel = h('div', { class: 'stmui-panel', tabindex: '-1' });
        if (picker.items().length > 6) this.panel.classList.add('stmui-panel-fixed');

        buildSheetHead(this, picker.title, picker.config.subtitle, picker.multi ? 'Done' : 'Close');

        this.input = h('input', {
            type: 'search',
            class: 'stmui-search-input text_pole',
            placeholder: picker.config.searchLabel ?? 'Search lorebooks',
            enterkeyhint: 'search',
            autocomplete: 'off',
            autocapitalize: 'off',
            spellcheck: 'false',
            'aria-label': picker.config.searchLabel ?? 'Search lorebooks',
        });
        this.input.addEventListener('input', () => {
            this.query = this.input.value;
            this.renderList(true);
        });
        this.input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.input.blur();
            }
        });
        this.clearSearch = h('button', {
            type: 'button',
            class: 'stmui-search-clear',
            'aria-label': 'Clear search',
            onclick: () => {
                this.input.value = '';
                this.query = '';
                this.renderList(true);
                this.input.focus();
            },
        }, [icon('fa-xmark')]);
        this.searchBox = h('div', { class: 'stmui-search' }, [icon('fa-magnifying-glass stmui-search-icon'), this.input, this.clearSearch]);

        this.tools = h('div', { class: 'stmui-tools' });
        this.list = h('ul', { class: 'stmui-list', role: 'listbox', 'aria-multiselectable': picker.multi ? 'true' : 'false' });
        this.status = h('p', { class: 'stmui-status', role: 'status', 'aria-live': 'polite' });
        this.hint = h('p', { class: 'stmui-hint', text: picker.multi ? 'Changes apply as you tap.' : `Tap to choose${picker.config.noun ? '' : ' a lorebook'}.` });

        this.controls = h('div', { class: 'stmui-controls' }, [this.searchBox, this.tools]);
        this.panel.append(this.head, this.controls, this.list, h('div', { class: 'stmui-foot' }, [this.status, this.hint]));
        this.dialog.append(this.panel);

        wireSheet(this);
        this.list.addEventListener('click', event => this.onListClick(event));
        this.renderTools();
        this.renderList(true);
    }

    onListClick(event) {
        const row = event.target.closest('.stmui-row');
        if (!row) return;
        const index = Number(row.dataset.index);
        const { picker } = this;
        if (event.target.closest('.stmui-edit')) {
            this.openInEditor(index);
            return;
        }
        const option = picker.select.options[index];
        if (!option) return;
        if (picker.multi) {
            picker.commit(index, !option.selected);
            this.refresh();
        } else {
            const already = option.selected;
            row.classList.add('stmui-row-flash');
            if (!already) picker.commit(index, true);
            this.refresh();
            setTimeout(() => closeSheet(), 160);
        }
    }

    openInEditor(index) {
        const name = this.picker.select.options[index]?.textContent?.trim();
        const editor = document.querySelector('#world_editor_select');
        if (!editor || !name) return;
        const target = Array.from(editor.options).find(option => option.textContent.trim() === name);
        if (!target) return;
        closeSheet();
        editor.value = target.value;
        editor.dispatchEvent(new Event('change', { bubbles: true }));
        // Opened from the wand menu the drawer is closed; show it so the book is visible.
        openPage('WI-SP-button');
        document.querySelector('#WorldInfo')?.scrollTo?.({ top: 0 });
    }

    renderTools() {
        const { picker } = this;
        this.tools.replaceChildren();
        if (!picker.multi) return;
        const selectedCount = picker.selectedItems().length;
        const seg = (id, label, count) => h('button', {
            type: 'button',
            class: `stmui-seg ${this.filter === id ? 'stmui-seg-on' : ''}`,
            'aria-pressed': String(this.filter === id),
            onclick: () => {
                this.filter = id;
                this.renderTools();
                this.renderList(true);
            },
        }, [label, h('span', { class: 'stmui-seg-count', text: String(count) })]);
        this.tools.append(
            h('div', { class: 'stmui-segmented', role: 'group' }, [
                seg('all', 'All', picker.realBookCount()),
                seg('selected', 'Selected', selectedCount),
            ]),
            h('button', {
                type: 'button',
                class: 'stmui-clear-all menu_button',
                disabled: selectedCount === 0,
                onclick: () => {
                    picker.clearAll();
                    this.refresh();
                },
            }, [icon('fa-eraser'), 'Clear all']),
        );
    }

    /** Re-reads the underlying control and updates rows in place. */
    refresh() {
        this.title.textContent = this.picker.title;
        this.renderTools();
        this.renderList(false);
    }

    badgesFor(item) {
        if (!this.picker.config.badges) return [];
        const badges = [];
        try {
            const context = ctx();
            const chatBook = context.chatMetadata?.world_info;
            const character = context.characters?.[context.characterId];
            const charBook = character?.data?.extensions?.world;
            if (charBook && charBook === item.text) badges.push('Character');
            if (chatBook && chatBook === item.text) badges.push('Chat');
        } catch {
            // Badges are decorative; ignore context lookup failures.
        }
        return badges;
    }

    renderList(resetScroll) {
        const { picker } = this;
        const previousScroll = this.list.scrollTop;
        const all = picker.items();
        const q = normalizeText(this.query.trim());
        let rows = all.filter(item => !q || item.isNone || normalizeText(item.text).includes(q));
        if (picker.multi && this.filter === 'selected') rows = rows.filter(item => item.selected);
        if (q) rows = rows.filter(item => !item.isNone || normalizeText(item.text).includes(q));

        this.clearSearch.hidden = !this.query;
        this.list.replaceChildren();

        for (const item of rows) {
            const badges = this.badgesFor(item);
            const mark = h('span', { class: 'stmui-mark', 'aria-hidden': 'true' }, [icon(picker.multi ? 'fa-check' : 'fa-circle')]);
            const name = h('span', { class: `stmui-name ${item.isNone ? 'stmui-name-none' : ''}` }, item.isNone ? [item.text] : highlight(item.text, this.query));
            const main = h('span', { class: 'stmui-main' }, [
                name,
                badges.length ? h('span', { class: 'stmui-badges' }, badges.map(text => h('span', { class: 'stmui-badge', text }))) : null,
            ]);
            const rowButton = h('button', {
                type: 'button',
                class: 'stmui-row-btn',
                role: 'option',
                'aria-selected': String(item.selected),
            }, [mark, main]);
            const li = h('li', {
                role: 'presentation',
                class: `stmui-row ${item.selected ? 'stmui-row-on' : ''} ${item.isNone ? 'stmui-row-none' : ''}`,
                'data-index': String(item.index),
            }, [rowButton]);
            if (picker.config.editable && !item.isNone) {
                li.append(h('button', {
                    type: 'button',
                    class: 'stmui-edit',
                    title: 'Open in lorebook editor',
                    'aria-label': `Open ${item.text} in the lorebook editor`,
                }, [icon('fa-pen-to-square')]));
            }
            this.list.append(li);
        }

        const realRows = rows.filter(item => !item.isNone).length;
        if (!realRows) {
            const total = picker.realBookCount();
            let message = 'Nothing matches your search.';
            if (!total) message = picker.config.noun ? 'No options available.' : 'No lorebooks found yet. Create one from the Lorebooks page.';
            else if (!q && this.filter === 'selected') message = 'Nothing selected yet.';
            this.list.append(h('li', { class: 'stmui-empty', text: message }));
        }

        const total = picker.realBookCount();
        const selectedCount = picker.selectedItems().length;
        this.status.textContent = picker.multi
            ? `${selectedCount} of ${total} selected`
            : (picker.selectedItems()[0] ? `Selected: ${picker.selectedItems()[0].text}` : 'Nothing selected');

        if (resetScroll) this.list.scrollTop = 0;
        else this.list.scrollTop = previousScroll;
        const firstSelected = this.list.querySelector('.stmui-row-on:not(.stmui-row-none)');
        if (resetScroll && !q && firstSelected && !picker.multi) {
            requestAnimationFrame(() => firstSelected.scrollIntoView({ block: 'center' }));
        }
    }
}

/** A sheet with arbitrary content: the "More" menu. */
class MenuSheet {
    /**
     * @param {{ title: string, subtitle?: string, fill: (body: HTMLElement) => void }} options
     */
    constructor({ title, subtitle, fill }) {
        this.picker = null;
        this.closing = false;
        this.fill = fill;
        this.dialog = h('dialog', { id: 'stmui-sheet', class: 'stmui-sheet stmui-menu-sheet', 'aria-label': title });
        this.panel = h('div', { class: 'stmui-panel', tabindex: '-1' });
        buildSheetHead(this, title, subtitle, 'Close');
        this.body = h('div', { class: 'stmui-menu-body' });
        this.panel.append(this.head, this.body);
        this.dialog.append(this.panel);
        wireSheet(this);
        this.refresh();
    }

    refresh() {
        const scroll = this.body.scrollTop;
        this.body.replaceChildren();
        this.fill(this.body);
        this.body.scrollTop = scroll;
    }
}

/**
 * Keeps an open sheet sized to the part of the screen above the keyboard. The
 * values go on the sheet itself, and nothing happens while no sheet is open:
 * on <html> they restyled the whole page on every frame of the keyboard's slide.
 */
function fitSheetToViewport() {
    const vv = window.visualViewport;
    const dialog = sheet?.dialog;
    if (!vv || !dialog) return;
    const height = `${Math.round(vv.height)}px`;
    const top = `${Math.round(vv.offsetTop)}px`;
    if (dialog.style.getPropertyValue('--stmui-vv-height') !== height) dialog.style.setProperty('--stmui-vv-height', height);
    if (dialog.style.getPropertyValue('--stmui-vv-top') !== top) dialog.style.setProperty('--stmui-vv-top', top);
    dialog.classList.toggle('stmui-compact', vv.height < COMPACT_BELOW);
}

function viewportFollow() {
    const vv = window.visualViewport;
    if (!vv) return;
    let frame = 0;
    const apply = () => {
        if (frame || !sheet) return;
        frame = requestAnimationFrame(() => {
            frame = 0;
            fitSheetToViewport();
        });
    };
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
        vv.removeEventListener('resize', apply);
        vv.removeEventListener('scroll', apply);
        cancelAnimationFrame(frame);
    };
}

let stopViewportFollow = null;

function showSheet(instance) {
    if (sheet) closeSheet(true);
    sheet = instance;
    // The viewport follower runs all the time Pocket Tavern is on (see applyState);
    // here the new sheet only needs to know whether the screen is short.
    sheet.dialog.classList.toggle('stmui-compact', (window.visualViewport?.height ?? window.innerHeight) < COMPACT_BELOW);
    fitSheetToViewport();
    document.body.append(sheet.dialog);
    sheet.dialog.showModal();
    // Opening focuses the first field; make sure that did not scroll the sheet.
    sheet.dialog.scrollTop = 0;
    requestAnimationFrame(() => sheet?.dialog.classList.add('stmui-sheet-open'));
    sheet.panel.focus({ preventScroll: true });
    scheduleHistorySync();
}

function openSheet(picker, options = {}) {
    showSheet(new Sheet(picker, options));
}

function closeSheet(immediate = false) {
    const current = sheet;
    if (!current || current.closing) return;
    current.closing = true;
    sheet = null;
    const finish = () => {
        if (current.dialog.open) current.dialog.close();
        current.dialog.remove();
    };
    if (immediate) {
        finish();
    } else {
        // Taps during the fade-out must not hit rows of a sheet that is already closing.
        current.dialog.style.pointerEvents = 'none';
        current.dialog.classList.remove('stmui-sheet-open');
        setTimeout(finish, 210);
    }
    scheduleHistorySync();
}

// ------------------------------------------------------- back gesture

/**
 * Android's back gesture should close whatever is on top (a sheet, a popup, a
 * page) instead of leaving SillyTavern. We keep one history entry per open
 * layer and reconcile after every change, so pages that SillyTavern opens or
 * closes on its own stay in step too.
 */
const nav = { depth: 0, suppress: 0, timer: 0, guard: 0, observer: null };

/**
 * Older SillyTavern overlays that are plain <div>s rather than <dialog>s.
 * The prompt editor comes first: it sits on top of the Presets page.
 */
const OVERLAYS = [
    { selector: '#completion_prompt_manager_popup', close: () => closePromptEditor(), open: () => promptEditorOpen() },
    { selector: '#shadow_select_chat_popup', close: '#select_chat_cross' },
    { selector: '#character_popup', close: '#character_cross' },
];

function isShown(element) {
    return !!element && getComputedStyle(element).display !== 'none';
}

// ------------------------------------------------------- message editor

/** SillyTavern edits a message in place; on a phone that edit gets its own full page. */
function editingTextarea() {
    return document.querySelector('#chat #curEditTextarea');
}

function editorOpen() {
    return active && settings.chatStyle && !!editingTextarea();
}

function saveEditor() {
    editingTextarea()?.closest('.mes')?.querySelector('.mes_edit_done')?.click();
}

function syncEditorState() {
    const on = editorOpen();
    document.documentElement.classList.toggle('stmui-editing', on);
    if (on) {
        const box = editingTextarea();
        // SillyTavern sizes the box to its text; the page gives it the whole height instead.
        box.style.removeProperty('height');
    }
    scheduleHistorySync();
}

// ------------------------------------------------------- prompt editor

const PROMPT_EDITOR = '#completion_prompt_manager_popup';

function promptEditor() {
    return document.querySelector(PROMPT_EDITOR);
}

/**
 * 'edit', 'inspect' or null. SillyTavern shows it with jQuery's slideDown and hides
 * it with slideUp, so its inline display is the truth. (The computed value lags:
 * drawers fade their `display` out with a transition. The class is not reliable
 * either: SillyTavern's tap-outside handler can drop it on its own.)
 */
function promptEditorMode() {
    const popup = promptEditor();
    const shown = popup?.style.display;
    if (!shown || shown === 'none') return null;
    return document.getElementById('completion_prompt_manager_popup_inspect')?.style.display === 'flex' ? 'inspect' : 'edit';
}

/** Open and not already sliding away (SillyTavern drops the class when it starts closing). */
function promptEditorOpen() {
    const popup = promptEditor();
    if (!promptEditorMode()) return false;
    return popup.classList.contains('openDrawer') || !$j()(popup).is(':animated');
}

/** Closes the prompt editor the way its own ✕ does, without saving. */
function closePromptEditor() {
    const mode = promptEditorMode();
    if (!mode) return false;
    const button = mode === 'inspect'
        ? document.getElementById('completion_prompt_manager_popup_close_button')
        : document.getElementById('completion_prompt_manager_popup_entry_form_close');
    if (button) button.click();
    else $j()(PROMPT_EDITOR).slideUp(150).removeClass('openDrawer');
    return true;
}

/**
 * The prompt name is a one-line <input>, so long names get cut off on a phone.
 * Show a wrapping box over it that writes straight back into SillyTavern's input.
 */
function syncPromptNameBox() {
    const input = document.getElementById('completion_prompt_manager_popup_entry_form_name');
    if (!input) return;
    let box = document.getElementById('stmui_prompt_name');
    const want = active && settings.touchSizing;
    if (!want) {
        box?.remove();
        input.classList.remove('stmui-native-hidden');
        return;
    }
    if (!box) {
        box = h('textarea', {
            id: 'stmui_prompt_name',
            class: 'text_pole stmui-prompt-name',
            rows: '1',
            'aria-label': 'Prompt name',
            enterkeyhint: 'done',
            autocomplete: 'off',
            spellcheck: 'false',
        });
        box.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                box.blur();
            }
        });
        box.addEventListener('input', () => {
            const clean = box.value.replace(/[\r\n]+/g, ' ');
            if (clean !== box.value) box.value = clean;
            input.value = clean;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            fitTextarea(box);
            shell?.update();
        });
        input.after(box);
        input.classList.add('stmui-native-hidden');
    }
    if (document.activeElement !== box && box.value !== input.value) box.value = input.value;
    box.disabled = input.disabled;
    box.readOnly = input.readOnly;
    fitTextarea(box);
}

/** Grows a textarea with its text where the browser cannot do it in CSS. */
function fitTextarea(box) {
    if (CSS.supports?.('field-sizing', 'content') || !box.isConnected) return;
    box.style.height = 'auto';
    box.style.height = `${box.scrollHeight}px`;
}

function openOverlays() {
    return OVERLAYS.filter(overlay => (overlay.open ? overlay.open() : isShown(document.querySelector(overlay.selector))));
}

function openLayerCount() {
    let count = 0;
    if (currentPageId()) count += 1;
    count += openOverlays().length;
    count += document.querySelectorAll('dialog.popup[open]').length;
    if (sheet) count += 1;
    if (viewer) count += 1;
    if (editorOpen()) count += 1;
    if (chatFinderOpen()) count += 1;
    if (openLoreEntry()) count += 1;
    if (settingsSectionOpen()) count += 1;
    return count;
}

function watchOverlays(on) {
    nav.observer?.disconnect();
    nav.observer = null;
    if (!on) return;
    nav.observer = new MutationObserver(() => scheduleHistorySync());
    for (const overlay of OVERLAYS) {
        const element = document.querySelector(overlay.selector);
        if (element) nav.observer.observe(element, { attributes: true, attributeFilter: ['style', 'class'] });
    }
}

function scheduleHistorySync(delay = 220) {
    window.clearTimeout(nav.timer);
    nav.timer = window.setTimeout(syncHistory, delay);
}

function syncHistory() {
    nav.timer = 0;
    if (!active || !settings.backGesture) return;
    if (nav.suppress) {
        scheduleHistorySync();
        return;
    }
    const want = openLayerCount();
    try {
        if (want > nav.depth) {
            while (nav.depth < want) {
                nav.depth += 1;
                history.pushState({ stmui: nav.depth }, '');
            }
        } else if (want < nav.depth) {
            const steps = nav.depth - want;
            nav.depth = want;
            nav.suppress += 1;
            history.go(-steps);
            // If no popstate arrives, do not leave the guard armed for a real back press.
            window.clearTimeout(nav.guard);
            nav.guard = window.setTimeout(() => { nav.suppress = 0; }, 800);
        }
    } catch (error) {
        console.debug(LOG, 'History sync skipped', error);
    }
}

function closeTopLayer() {
    if (viewer) {
        closeViewer();
        return true;
    }
    if (sheet) {
        closeSheet();
        return true;
    }
    const popups = document.querySelectorAll('dialog.popup[open]');
    if (popups.length) {
        popups[popups.length - 1].dispatchEvent(new Event('cancel', { cancelable: true }));
        return true;
    }
    if (editorOpen()) {
        // Back keeps your changes, like a notes app. Cancel is still a tap away.
        saveEditor();
        return true;
    }
    if (chatFinderOpen()) {
        closeChatFinder();
        return true;
    }
    if (openLoreEntry()) {
        closeLoreEntry();
        return true;
    }
    const overlays = openOverlays();
    if (overlays.length) {
        const { close } = overlays[0];
        if (typeof close === 'function') close();
        else $j()(close).trigger('click');
        return true;
    }
    if (closeSettingsSection()) return true;
    if (currentPageId()) {
        closePages();
        return true;
    }
    return false;
}

function onPopState(event) {
    if (nav.suppress > 0) {
        nav.suppress -= 1;
        return;
    }
    if (!active || !settings.backGesture) return;
    if (nav.depth > 0) {
        nav.depth -= 1;
        closeTopLayer();
        scheduleHistorySync(400);
    } else if (event.state?.stmui) {
        // A leftover entry from before a reload: nothing is open, so keep going back.
        history.back();
    }
}

function resetHistoryTracking() {
    window.clearTimeout(nav.timer);
    nav.depth = 0;
    nav.suppress = 0;
}

// ------------------------------------------------------------ pages

function drawerById(id) {
    const drawer = document.getElementById(id);
    return drawer?.classList.contains('drawer') ? drawer : null;
}

/** The id of the top-bar drawer that is currently open, if any. */
function currentPageId() {
    const content = document.querySelector('#top-settings-holder > .drawer > .drawer-content.openDrawer');
    return content?.closest('.drawer')?.id || null;
}

function pageInfo(drawer) {
    const known = PAGES[drawer.id];
    if (known) return known;
    const iconEl = drawer.querySelector('.drawer-icon');
    const faClass = Array.from(iconEl?.classList ?? []).find(name => name.startsWith('fa-') && !['fa-solid', 'fa-fw', 'fa-regular'].includes(name));
    const title = iconEl?.getAttribute('title') || drawer.getAttribute('title') || drawer.id.replace(/[-_]+/g, ' ');
    return { title, long: '', icon: faClass ?? 'fa-puzzle-piece' };
}

function openPage(id) {
    const drawer = drawerById(id);
    if (!drawer) return;
    if (drawer.querySelector(':scope > .drawer-content')?.classList.contains('openDrawer')) return;
    drawer.querySelector(':scope > .drawer-toggle')?.click();
}

function closePages() {
    // The prompt editor lives outside the Presets drawer and would stay on screen.
    closePromptEditor();
    for (const content of document.querySelectorAll('#top-settings-holder > .drawer > .drawer-content.openDrawer')) {
        content.parentElement.querySelector(':scope > .drawer-toggle')?.click();
    }
}

/** Leaves the open chat for SillyTavern's start screen with the recent chats. */
function goHome() {
    closePages();
    // SillyTavern's own "Close chat" (it waits until a reply has finished).
    document.getElementById('option_close_chat')?.click();
}

/**
 * Shows SillyTavern's character list in the right panel. Skipped when the list is
 * already showing: asking again makes SillyTavern throw the list away and draw it anew.
 */
function showCharacterList() {
    const block = document.getElementById('rm_characters_block');
    if (block && block.style.display !== 'none' && getComputedStyle(block).display !== 'none' && block.querySelector('#rm_print_characters_block > *')) return;
    document.getElementById('rm_button_characters')?.click();
}

// ------------------------------------------------------------ app shell

let shell = null;

function isTypingField(element) {
    return !!element?.matches?.('textarea, input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]):not([type="file"]), [contenteditable="true"]');
}

class Shell {
    constructor() {
        this.drawerObserver = null;
        this.keyboardBase = { width: 0, height: 0 };
        this.focusAt = 0;
        this.resizeFrame = 0;
        // The keyboard slides in over many frames; look once per frame at most.
        // Checked right away on resize: the tab bar steps aside in the same frame
        // the screen shrinks for the keyboard, so there is one change, not two.
        this.onResize = () => this.checkKeyboard();
        this.lastHeight = window.innerHeight;
        this.onFocusIn = event => {
            if (isTypingField(event.target)) setTimeout(() => this.checkKeyboard(), 400);
            // Writing a message: the tabs go away again.
            if (event.target?.id === 'send_textarea') this.tuckAgain();
        };
        this.tabsOut = false;
        this.inChat = false;
        this.touchY = null;
        // Scrolling the chat with a finger or the wheel tucks the tabs away again
        // (not the chat moving by itself while a reply streams in).
        this.onChatTouchStart = event => {
            this.touchY = event.touches[0]?.clientY ?? null;
        };
        this.onChatTouchMove = event => {
            if (this.touchY === null || !this.tabsOut) return;
            if (Math.abs((event.touches[0]?.clientY ?? this.touchY) - this.touchY) > 24) this.tuckAgain();
        };
        this.onChatWheel = () => this.tuckAgain();
        this.onFocusOut = () => setTimeout(() => this.checkKeyboard(), 0);
        this.build();
    }

    build() {
        // ---- top app bar
        this.back = h('button', {
            type: 'button',
            class: 'stmui-ab-btn stmui-ab-back',
            'aria-label': 'Back',
            // Step back one level: the prompt editor first, then the page.
            onclick: () => {
                if (!closePromptEditor() && !closeSettingsSection()) closePages();
            },
        }, [ui('arrow-left')]);
        this.avatar = h('span', { class: 'stmui-ab-avatar', 'aria-hidden': 'true' });
        this.titleEl = h('span', { class: 'stmui-ab-title' });
        this.subEl = h('span', { class: 'stmui-ab-sub' });
        this.who = h('button', { type: 'button', class: 'stmui-ab-who', onclick: () => this.onWhoClick() }, [
            this.avatar,
            h('span', { class: 'stmui-ab-text' }, [this.titleEl, this.subEl]),
        ]);
        this.translateBadge = h('span', { class: 'stmui-ab-badge', 'aria-hidden': 'true' });
        this.translateBtn = h('button', {
            type: 'button',
            class: 'stmui-ab-btn stmui-ab-translate',
            'aria-label': 'Translate chat',
            title: 'Tap to translate, hold to pick the language',
        }, [ui('languages'), this.translateBadge]);
        // Tap: translate the chat (or back to the original). Hold: pick the language.
        let translateHold = 0;
        let translateHeld = 0;
        this.translateBtn.addEventListener('pointerdown', () => {
            window.clearTimeout(translateHold);
            translateHold = window.setTimeout(() => {
                translateHeld = Date.now();
                buzz(15);
                openTranslateSheet();
            }, 450);
        });
        for (const type of ['pointerup', 'pointercancel', 'pointerleave']) this.translateBtn.addEventListener(type, () => window.clearTimeout(translateHold));
        this.translateBtn.addEventListener('contextmenu', event => event.preventDefault());
        this.translateBtn.addEventListener('click', () => {
            if (Date.now() - translateHeld < 700) return;
            buzz(6);
            quickTranslate();
        });
        this.actions = h('div', { class: 'stmui-ab-actions' }, [
            this.translateBtn,
            h('button', {
                type: 'button',
                class: 'stmui-ab-btn stmui-ab-chats',
                'aria-label': 'Chat history',
                title: 'Chat history',
                onclick: () => document.getElementById('option_select_chat')?.click(),
            }, [ui('history')]),
            h('button', {
                type: 'button',
                class: 'stmui-ab-btn stmui-ab-new',
                'aria-label': 'Start a new chat',
                title: 'New chat',
                onclick: () => document.getElementById('option_start_new_chat')?.click(),
            }, [ui('chat-plus')]),
        ]);
        this.quick = h('button', {
            type: 'button',
            class: 'stmui-ab-btn stmui-ab-quick',
            'aria-label': t('Quick switch'),
            title: t('Quick switch'),
            onclick: () => {
                buzz(6);
                openQuickSwitch();
            },
        }, [ui('zap')]);
        this.search = h('button', {
            type: 'button',
            class: 'stmui-ab-btn stmui-ab-search',
            'aria-label': t('Find a setting'),
            title: t('Find a setting'),
            onclick: () => (currentPageId() ? openSettingSearch() : openGlobalSearch()),
        }, [ui('search')]);
        this.home = h('button', {
            type: 'button',
            class: 'stmui-ab-btn stmui-ab-home',
            'aria-label': 'Recent chats',
            title: 'Recent chats',
            onclick: () => goHome(),
        }, [ui('home')]);
        this.appbar = h('header', { id: 'stmui-appbar', class: 'stmui-appbar', 'data-stmui': '1' }, [this.back, this.home, this.who, this.search, this.quick, this.actions]);

        // ---- bottom tab bar
        this.tabs = new Map();
        const tabButtons = TABS.map(tab => {
            const button = h('button', {
                type: 'button',
                class: 'stmui-tab',
                'data-tab': tab.id,
                'aria-label': tab.label,
                onclick: () => this.onTab(tab.id),
            }, [
                h('span', { class: 'stmui-tab-icon' }, [ui(tab.icon)]),
                h('span', { class: 'stmui-tab-label', text: tab.label }),
            ]);
            this.tabs.set(tab.id, button);
            return button;
        });
        // One pill slides between tabs instead of each tab fading its own background.
        this.indicator = h('span', { class: 'stmui-tab-indicator', 'aria-hidden': 'true' });
        this.tabbar = h('nav', { id: 'stmui-tabbar', class: 'stmui-tabbar', 'aria-label': 'Main', 'data-stmui': '1' }, [this.indicator, ...tabButtons]);

        for (const el of [this.appbar, this.tabbar]) shieldFromDrawerAutoClose(el);

        document.body.append(this.appbar, this.tabbar);

        // The Characters page switches between list, editor and group views without events.
        // Picking someone from the list should land in their chat, like a messaging app.
        this.jumpAt = 0;
        this.onPanelClick = event => {
            const entry = event.target.closest?.('#rm_print_characters_block .character_select, #rm_print_characters_block .group_select');
            const bulk = document.querySelector('#rm_print_characters_block.group_overlay_mode_select');
            if (entry && !bulk && !event.target.closest('.ch_fav_icon, .tag, .bulk_select_checkbox')) {
                this.jumpAt = Date.now();
                // Tapping the character you are already chatting with does not change chats.
                const current = ctx().characterId;
                if (entry.dataset.chid !== undefined && current !== undefined && String(entry.dataset.chid) === String(current)) setTimeout(closePages, 200);
            }
            setTimeout(() => this.update(), 80);
        };
        document.getElementById('right-nav-panel')?.addEventListener('click', this.onPanelClick);

        // Follow SillyTavern opening and closing its drawers, whoever triggers it.
        this.drawerObserver = new MutationObserver(() => {
            this.update();
            scheduleHistorySync();
        });
        for (const content of document.querySelectorAll('#top-settings-holder > .drawer > .drawer-content')) {
            this.drawerObserver.observe(content, { attributes: true, attributeFilter: ['class'] });
        }
        window.addEventListener('resize', this.onResize);
        document.addEventListener('focusin', this.onFocusIn);
        document.addEventListener('focusout', this.onFocusOut);
        const chat = document.getElementById('chat');
        chat?.addEventListener('touchstart', this.onChatTouchStart, { passive: true });
        chat?.addEventListener('touchmove', this.onChatTouchMove, { passive: true });
        chat?.addEventListener('wheel', this.onChatWheel, { passive: true });
        this.checkKeyboard();
        this.update();
    }

    /**
     * In a chat the tab bar tucks away: it sat right under the message box and
     * caught taps meant for it. The arrow in the message box brings it back.
     */
    syncTuck(animate = false) {
        const root = document.documentElement;
        const can = this.inChat && tabsTuckable();
        if (!can) this.tabsOut = false;
        root.classList.toggle('stmui-tabs-tuckable', can);
        this.setTucked(can && !this.tabsOut, animate);
        syncTabsButton();
    }

    setTucked(on, animate) {
        const root = document.documentElement;
        if (root.classList.contains('stmui-tabs-tucked') === on) return;
        const form = document.getElementById('form_sheld');
        const chat = document.getElementById('chat');
        const atBottom = !!chat && chat.scrollHeight - chat.scrollTop - chat.clientHeight < 40;
        const glide = animate && motionAllowed() && form && !root.classList.contains('stmui-keyboard');
        const before = glide ? form.getBoundingClientRect().top : 0;
        root.classList.toggle('stmui-tabs-tucked', on);
        if (atBottom) chat.scrollTop = chat.scrollHeight;
        if (!glide) return;
        // Coming back it slides up from the bottom edge (going away, CSS slides it down).
        if (!on) this.tabbar.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 200, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
        // The message box (and the newest message above it) glide to their new place with the tabs.
        const shift = form.getBoundingClientRect().top - before;
        if (Math.abs(shift) < 4) return;
        const frames = [{ transform: `translate3d(0, ${-shift}px, 0)` }, { transform: 'none' }];
        const timing = { duration: 200, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' };
        form.animate(frames, timing);
        if (atBottom) chat.animate(frames, timing);
    }

    /** The arrow in the message box: show the tabs, or put them away again. */
    toggleTabs() {
        this.tabsOut = document.documentElement.classList.contains('stmui-tabs-tucked');
        this.syncTuck(true);
    }

    tuckAgain() {
        if (!this.tabsOut) return;
        this.tabsOut = false;
        this.syncTuck(true);
    }

    destroy() {
        window.clearTimeout(this.settleTimer);
        document.getElementById('right-nav-panel')?.removeEventListener('click', this.onPanelClick);
        this.drawerObserver?.disconnect();
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('focusin', this.onFocusIn);
        document.removeEventListener('focusout', this.onFocusOut);
        const chat = document.getElementById('chat');
        chat?.removeEventListener('touchstart', this.onChatTouchStart);
        chat?.removeEventListener('touchmove', this.onChatTouchMove);
        chat?.removeEventListener('wheel', this.onChatWheel);
        cancelAnimationFrame(this.resizeFrame);
        this.appbar.remove();
        this.tabbar.remove();
        const root = document.documentElement;
        root.classList.remove('stmui-page-open', 'stmui-keyboard', 'stmui-prompt-editor', 'stmui-tabs-tucked', 'stmui-tabs-tuckable');
        syncTabsButton();
        delete root.dataset.stmuiPage;
    }

    /** Hides the tab bar while the on-screen keyboard is up (the layout shrinks with it). */
    checkKeyboard() {
        if (document.documentElement.classList.contains('stmui-wide')) {
            document.documentElement.classList.remove('stmui-keyboard');
            this.lastHeight = window.innerHeight;
            return;
        }
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (Math.abs(width - this.keyboardBase.width) > 40) this.keyboardBase = { width, height };
        if (height > this.keyboardBase.height) this.keyboardBase.height = height;
        const typing = isTypingField(document.activeElement);
        const keyboard = typing && height < this.keyboardBase.height * 0.78;
        const root = document.documentElement;
        const was = root.classList.contains('stmui-keyboard');
        const tabbar = this.tabbar?.offsetHeight || this.tabH || 0;
        if (!was && tabbar) this.tabH = tabbar;
        const before = this.lastHeight;
        this.lastHeight = height;
        root.classList.toggle('stmui-keyboard', keyboard);
        if (height === before && keyboard === was) return;
        // Reading the newest message: stay there while the screen changes.
        const chat = document.getElementById('chat');
        if (chat && extras.atBottom !== false) chat.scrollTop = chat.scrollHeight;
        // The message box glides from where it was to its new place (movement
        // only), so it follows the keyboard instead of jumping.
        const form = document.getElementById('form_sheld');
        if (!form || !motionAllowed() || keyboard === was) return;
        const tab = root.classList.contains('stmui-tabs-tucked') ? 0 : (this.tabH || 0);
        const shift = (height - (keyboard ? 0 : tab)) - (before - (was ? 0 : tab));
        if (Math.abs(shift) < 8) return;
        form.animate([{ transform: `translate3d(0, ${-shift}px, 0)` }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    }

    onTab(id) {
        buzz(6);
        if (id === 'more') {
            openMoreSheet();
            return;
        }
        if (sheet) closeSheet(true);
        if (id === 'chat') {
            if (!currentPageId() && this.tabsOut) this.tuckAgain();
            else closePages();
            return;
        }
        const open = currentPageId();
        if (open === id) {
            // Tapping the current tab goes "home" within it.
            if (id === 'rightNavHolder') showCharacterList();
            else document.querySelector(`#${id} > .drawer-content`)?.scrollTo?.({ top: 0, behavior: 'smooth' });
            return;
        }
        // Switch to the list first, so the page slides in already showing it
        // instead of showing the open character's card and then changing.
        if (id === 'rightNavHolder') showCharacterList();
        openPage(id);
    }

    /** Called when SillyTavern switches chats. */
    onChatChanged() {
        if (this.jumpAt && Date.now() - this.jumpAt < 4000 && currentPageId() === 'rightNavHolder') closePages();
        this.jumpAt = 0;
        this.tabsOut = false;
        this.update();
    }

    onWhoClick() {
        if (currentPageId()) return;
        const context = ctx();
        if (context.groupId || context.characterId !== undefined) openPage('rightNavHolder');
        else {
            showCharacterList();
            openPage('rightNavHolder');
        }
    }

    update() {
        const pageId = currentPageId();
        // When SillyTavern swaps one drawer for another, none is open for a moment.
        // Wait that out instead of flashing the chat header in between.
        if (!pageId && this.lastPage) {
            window.clearTimeout(this.settleTimer);
            this.settleTimer = window.setTimeout(() => {
                this.lastPage = currentPageId();
                this.render(this.lastPage);
            }, 200);
            return;
        }
        window.clearTimeout(this.settleTimer);
        this.lastPage = pageId;
        this.render(pageId);
    }

    render(pageId) {
        const before = this.titleEl.textContent;
        this.renderContent(pageId);
        // A short slide when the title changes, so moving between pages feels connected.
        if (before && before !== this.titleEl.textContent) {
            // Two classes with the same animation: switching restarts it without forcing a layout.
            this.swapFlip = !this.swapFlip;
            this.who.classList.toggle('stmui-ab-swap', this.swapFlip);
            this.who.classList.toggle('stmui-ab-swap-b', !this.swapFlip);
        }
    }

    renderContent(pageId) {
        const root = document.documentElement;
        // Settings opens on its list of sections again next time.
        if (pageId !== 'user-settings-button' && setnav.view !== 'home') {
            setnav.view = 'home';
            applySettingsView();
        }
        root.classList.toggle('stmui-page-open', !!pageId);
        if (pageId) root.dataset.stmuiPage = pageId;
        else delete root.dataset.stmuiPage;

        const tabId = !pageId ? 'chat' : (this.tabs.has(pageId) ? pageId : 'more');
        this.tabbar.style.setProperty('--stmui-tab-index', String(TABS.findIndex(tab => tab.id === tabId)));
        for (const [id, button] of this.tabs) {
            const on = id === tabId;
            button.classList.toggle('stmui-tab-on', on);
            if (on) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        }

        if (pageId) {
            const drawer = drawerById(pageId);
            if (drawer && settings.touchSizing) {
                requestAnimationFrame(() => fillRanges(drawer));
                addSliderSteppers(drawer);
                if (pageId === 'user-settings-button') syncSettingsNav();
                if (SEARCH_PAGES.includes(pageId)) {
                    describeSettings(drawer);
                    // Presets and API fill parts of their page a moment later.
                    setTimeout(() => describeSettings(drawer), 600);
                }
                if (pageId === 'extensions-settings-button') describeExtensions();
            }
            const info = drawer ? pageInfo(drawer) : { title: '', icon: 'fa-gear' };
            this.titleEl.textContent = t(info.title);
            this.subEl.textContent = t(info.long ?? '');
            this.subEl.classList.remove('stmui-ab-offline');
            // Switch back to "Presets" as soon as the editor starts sliding away.
            const editorMode = promptEditorOpen() ? promptEditorMode() : null;
            root.classList.toggle('stmui-prompt-editor', !!editorMode);
            if (editorMode === 'edit') {
                const name = document.getElementById('completion_prompt_manager_popup_entry_form_name')?.value?.trim();
                this.titleEl.textContent = t('Edit prompt');
                this.subEl.textContent = name || t('New prompt');
            } else if (editorMode === 'inspect') {
                this.titleEl.textContent = t('Prompt list');
                this.subEl.textContent = t('Prompts linked to this marker');
            }
            if (pageId === 'rightNavHolder') {
                syncCharacterPage();
                const editing = isShown(document.getElementById('rm_ch_create_block'));
                const name = document.getElementById('character_name_pole')?.value?.trim();
                if (editing) this.subEl.textContent = name ? t('Editing {name}', { name }) : t('New character');
                else if (isShown(document.getElementById('rm_group_chats_block'))) this.subEl.textContent = t('Group chat');
            }
            let headIcon = info.icon;
            const section = pageId === 'user-settings-button' && setnav.view !== 'home' && SETTINGS_SECTIONS.find(item => item.id === setnav.view);
            if (section) {
                this.titleEl.textContent = t(section.title);
                this.subEl.textContent = t('Settings');
                headIcon = section.icon;
            }
            this.search.hidden = !SEARCH_PAGES.includes(pageId) || !!editorMode;
            this.quick.hidden = true;
            this.avatar.replaceChildren(ui(headIcon));
            this.avatar.classList.add('stmui-ab-avatar-icon');
            this.who.disabled = true;
            this.appbar.classList.add('stmui-ab-page');
            this.inChat = false;
            this.syncTuck();
            return;
        }

        this.appbar.classList.remove('stmui-ab-page');
        root.classList.remove('stmui-prompt-editor');
        this.search.hidden = true;
        this.quick.hidden = false;
        this.who.disabled = false;
        const context = ctx();
        let name = 'SillyTavern';
        let image = null;
        let hasChat = false;
        if (context.groupId) {
            const group = context.groups?.find(g => String(g.id) === String(context.groupId));
            name = group?.name ?? t('Group chat');
            hasChat = true;
        } else if (context.characterId !== undefined && context.characters?.[context.characterId]) {
            const character = context.characters[context.characterId];
            name = character.name;
            image = character.avatar && character.avatar !== 'none'
                ? (context.getThumbnailUrl?.('avatar', character.avatar) ?? `/thumbnail?type=avatar&file=${encodeURIComponent(character.avatar)}`)
                : null;
            hasChat = true;
        }
        this.titleEl.textContent = name;
        const status = context.onlineStatus;
        const connected = status && status !== 'no_connection';
        // Some APIs report "Valid" (the key check) instead of a model name.
        this.subEl.textContent = !connected ? t('Not connected') : (/^valid$/i.test(String(status)) ? t('Connected') : t(String(status)));
        this.subEl.classList.toggle('stmui-ab-offline', !connected);
        this.avatar.classList.remove('stmui-ab-avatar-icon');
        if (image) this.avatar.replaceChildren(h('img', { src: image, alt: '' }));
        else this.avatar.replaceChildren(ui(context.groupId ? 'users' : (hasChat ? 'user' : 'chats')));
        this.actions.hidden = !hasChat;
        this.search.hidden = hasChat;
        const shownIn = hasChat ? chatLanguage() : null;
        this.translateBtn.classList.toggle('stmui-ab-on', !!shownIn);
        const next = shownIn ?? quickLanguage();
        this.translateBadge.textContent = next ? next.split('-')[0].toUpperCase() : '';
        this.translateBadge.hidden = !next;
        this.translateBtn.setAttribute('aria-label', shownIn ? t('Show original') : (next ? t('Translate to {lang}', { lang: languageName(next) }) : t('Translate chat')));
        this.home.hidden = !hasChat;
        this.inChat = hasChat;
        this.syncTuck();
    }
}

function tabsTuckable() {
    const root = document.documentElement;
    return active && settings.appShell && settings.chatStyle && settings.hideTabsInChat && !root.classList.contains('stmui-wide');
}

function syncTabsButton() {
    const button = composer.tabs;
    if (!button) return;
    const tucked = document.documentElement.classList.contains('stmui-tabs-tucked');
    const label = t(tucked ? 'Show tabs' : 'Hide tabs');
    button.setAttribute('aria-expanded', String(!tucked));
    button.setAttribute('aria-label', label);
    button.title = label;
    button.classList.toggle('stmui-tabs-btn-out', !tucked);
}

function openMoreSheet() {
    showSheet(new MenuSheet({
        title: 'More',
        subtitle: '',
        fill: body => {
            const drawers = Array.from(document.querySelectorAll('#top-settings-holder > .drawer'))
                .filter(drawer => drawer.id && !TABS.some(tab => tab.id === drawer.id));
            drawers.sort((a, b) => {
                const ai = MORE_ORDER.indexOf(a.id);
                const bi = MORE_ORDER.indexOf(b.id);
                return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
            });
            const openId = currentPageId();
            const status = ctx().onlineStatus;
            const tiles = drawers.map(drawer => {
                const info = pageInfo(drawer);
                // Only notes that add something: "Backgrounds / Chat backgrounds" just repeats the title.
                let note = TILE_NOTES[drawer.id] ?? '';
                if (drawer.id === 'sys-settings-button') note = status && status !== 'no_connection' ? 'Connected' : 'Not connected';
                return h('button', {
                    type: 'button',
                    class: `stmui-tile ${openId === drawer.id ? 'stmui-tile-on' : ''} ${drawer.id === 'sys-settings-button' && note === 'Not connected' ? 'stmui-tile-warn' : ''}`,
                    onclick: () => {
                        closeSheet(true);
                        openPage(drawer.id);
                    },
                }, [
                    h('span', { class: 'stmui-tile-icon' }, [ui(info.icon)]),
                    h('span', { class: 'stmui-tile-label', text: info.title }),
                    note ? h('span', { class: 'stmui-tile-note', text: note }) : null,
                ]);
            });
            body.append(h('button', {
                type: 'button',
                class: 'stmui-search-field',
                onclick: () => openGlobalSearch(),
            }, [ui('search'), h('span', { text: 'Search everything' })]));
            body.append(h('div', { class: 'stmui-tiles' }, tiles));

            const context = ctx();
            const inChat = !!(context.groupId || context.characterId !== undefined);
            const row = (iconName, label, onclick, disabled = false) => h('button', {
                type: 'button', class: 'stmui-menu-row', disabled, onclick,
            }, [ui(iconName, 'stmui-menu-row-icon'), h('span', { text: t(label) }), ui('chevron-right', 'stmui-menu-row-go')]);
            const themeName = findTheme(settings.theme)?.name ?? t('Your theme');
            body.append(h('div', { class: 'stmui-menu-list' }, [
                h('button', {
                    type: 'button',
                    class: 'stmui-menu-row stmui-menu-row-theme',
                    onclick: () => openThemeSheet(),
                }, [ui('palette', 'stmui-menu-row-icon'), h('span', { text: 'Themes' }), h('small', { class: 'stmui-menu-row-note', text: themeName }), ui('chevron-right', 'stmui-menu-row-go')]),
                row('home', 'Recent chats', () => {
                    closeSheet(true);
                    goHome();
                }, !inChat),
                row('history', 'Chat history', () => {
                    closeSheet(true);
                    document.getElementById('option_select_chat')?.click();
                }, !inChat),
                row('chat-plus', 'Start a new chat', () => {
                    closeSheet(true);
                    closePages();
                    document.getElementById('option_start_new_chat')?.click();
                }, !inChat),
                row('phone', 'Phone features', () => openExtrasSheet()),
                row('zap', 'Quick switch', () => openQuickSwitch()),
                row('languages', 'Translate chat', () => openTranslateSheet(), !inChat),
                row('search', 'Search this chat', () => {
                    closeSheet(true);
                    // The bar searches the chat, so show the chat, not the page that was open.
                    closePages();
                    openChatFinder();
                }, !inChat),
                isStandalone() ? null : row('download', 'Install as an app', () => installApp()),
                row('star', "What's new", () => openWhatsNew()),
                row('phone', 'Pocket Tavern settings', () => {
                    closeSheet(true);
                    openMobileSettings();
                }),
            ]));
        },
    }));
}

function openMobileSettings() {
    openPage('extensions-settings-button');
    setTimeout(() => {
        // The container uses `display: contents`, so scroll to the drawer inside it.
        const drawer = document.querySelector('#stmui_settings .inline-drawer');
        if (!drawer) return;
        const content = drawer.querySelector('.inline-drawer-content');
        if (content && getComputedStyle(content).display === 'none') drawer.querySelector('.inline-drawer-toggle')?.click();
        drawer.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 250);
}

function syncShell() {
    const want = active && settings.appShell;
    if (want && !shell) shell = new Shell();
    else if (!want && shell) {
        shell.destroy();
        shell = null;
    }
}

// ------------------------------------------------------------ slider fill

/** SillyTavern leaves the slider's filled part at a fixed width; make it follow the value. */
function updateRangeFill(input) {
    const min = input.min === '' ? 0 : Number(input.min);
    const max = input.max === '' ? 100 : Number(input.max);
    const value = Number(input.value);
    const percent = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
    input.style.setProperty('--stmui-fill', `${percent.toFixed(1)}%`);
}

function fillRanges(root = document) {
    for (const input of root.querySelectorAll('input[type="range"]')) updateRangeFill(input);
}

function watchRanges(on) {
    const $ = $j();
    $(document).off('.stmuiRange');
    if (on) {
        // jQuery delegation sees both real input and SillyTavern's own .trigger('input').
        $(document).on('input.stmuiRange change.stmuiRange', 'input[type="range"]', function () {
            updateRangeFill(this);
        });
        fillRanges();
    } else {
        for (const input of document.querySelectorAll('input[type="range"]')) input.style.removeProperty('--stmui-fill');
    }
}

// ------------------------------------------------------------ appearance

function ensureStyle(id) {
    let element = document.getElementById(id);
    if (!element) {
        element = h('style', { id });
        document.head.append(element);
    }
    return element;
}

let originalThemeColor;
let themeColorCall = 0;

/** Android's status bar follows <meta name="theme-color">; match it to the app bar. */
function syncThemeColor(theme) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (originalThemeColor === undefined) originalThemeColor = meta ? meta.getAttribute('content') : null;
    if (!active) {
        if (meta && originalThemeColor === null) meta.remove();
        else if (meta) meta.setAttribute('content', originalThemeColor);
        return;
    }
    if (!meta) {
        meta = h('meta', { name: 'theme-color' });
        document.head.append(meta);
    }
    const call = (themeColorCall += 1);
    if (theme) {
        meta.setAttribute('content', theme.bg);
        return;
    }
    // Reading a CSS color makes the browser restyle the page at once; wait for the next frame instead.
    const target = meta;
    requestAnimationFrame(() => {
        if (!active || !target.isConnected || call !== themeColorCall) return;
        const own = getComputedStyle(document.documentElement).getPropertyValue('--SmartThemeBlurTintColor').trim();
        target.setAttribute('content', own || '#171717');
    });
}

const TOAST_ICONS = { success: 'circle-check', info: 'info', warning: 'alert-triangle', error: 'alert-circle' };

function toastIconCss() {
    return Object.entries(TOAST_ICONS)
        .map(([type, name]) => `html.stmui-toasts #toast-container > .toast-${type} { --stmui-t-icon: ${iconUrl(name)}; }`)
        .join(' ')
        // A grey magnifier drawn inside search boxes.
        + ` html.stmui-on { --stmui-search-icon: ${iconUrl('search').replace('%23000', '%23909090')}; --stmui-think-icon: ${iconUrl('bulb')}; --stmui-regen-icon: ${iconUrl('refresh')}; }`;
}

function applyAppearance() {
    const root = document.documentElement;
    const theme = active ? findTheme(settings.theme) : null;
    root.classList.toggle('stmui-themed', !!theme);
    root.classList.toggle('stmui-backdrop', !!theme && settings.themeBackdrop);
    root.classList.toggle('stmui-font', active && settings.modernFont);
    root.classList.toggle('stmui-icons', active && settings.customIcons);
    root.classList.toggle('stmui-toasts', active && settings.niceToasts);
    for (const level of Object.keys(MOTION_LABELS)) root.classList.toggle(`stmui-motion-${level}`, active && settings.motion === level);
    if (theme) root.dataset.stmuiTheme = theme.id;
    else delete root.dataset.stmuiTheme;

    if (active) {
        ensureStyle('stmui-theme-css').textContent = themeCss(theme, 'html.stmui-on.stmui-themed') + toastIconCss();
        if (settings.customIcons) {
            const icons = ensureStyle('stmui-icons-css');
            if (!icons.textContent) icons.textContent = iconCss('html.stmui-icons');
        }
    } else {
        document.getElementById('stmui-theme-css')?.remove();
        document.getElementById('stmui-icons-css')?.remove();
    }
    syncThemeColor(theme);
}

/** Runs `change` behind a circular reveal that grows from `origin` (View Transitions). */
function revealChange(origin, change) {
    const root = document.documentElement;
    const canAnimate = typeof document.startViewTransition === 'function'
        && settings.motion === 'full'
        && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canAnimate) {
        change();
        return;
    }
    const rect = origin?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : innerHeight / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('stmui-vt');
    // The browser runs the change once it has captured the old look. If that capture
    // is ever delayed (busy or backgrounded page), apply the change anyway.
    let done = false;
    const run = () => {
        if (done) return;
        done = true;
        change();
    };
    window.setTimeout(run, 700);
    const transition = document.startViewTransition(run);
    transition.ready.then(() => {
        root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 560, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
        );
    }).catch(() => {});
    transition.finished.finally(() => root.classList.remove('stmui-vt'));
}

function setAppearance(key, value, origin) {
    if (settings[key] === value) return;
    const change = () => {
        settings[key] = value;
        saveSettings();
        applyAppearance();
        syncExtras();
        syncSettingsInputs();
        shell?.update();
        // Switches already show their new state; re-render only what depends on the choice.
        if (sheet && !sheet.picker && ['theme', 'motion', 'textSize', 'chatLook', 'uiSize', 'composerStyle'].includes(key)) sheet.refresh();
    };
    if (key === 'theme') revealChange(origin, change);
    else change();
}

/** Colors for a theme card preview. "Your theme" reads SillyTavern's own values. */
function previewColors(theme) {
    if (theme) {
        return { bg: theme.bg, raised: theme.raised, text: theme.text, accent: theme.accent, user: theme.user, backdrop: theme.backdrop };
    }
    // SillyTavern writes its theme colors inline on <html>; our overrides live in a stylesheet.
    const inline = document.documentElement.style;
    const read = (name, fallback) => inline.getPropertyValue(name).trim() || fallback;
    const bg = read('--SmartThemeBlurTintColor', '#171717');
    const text = read('--SmartThemeBodyColor', '#dcdcd2');
    const accent = read('--SmartThemeQuoteColor', '#e18a24');
    return {
        bg,
        raised: `color-mix(in srgb, ${text} 9%, ${bg})`,
        text,
        accent,
        user: `color-mix(in srgb, ${accent} 16%, transparent)`,
        backdrop: bg,
    };
}

function themeCard(theme, current) {
    const id = theme?.id ?? 'st';
    const colors = previewColors(theme);
    const preview = h('span', { class: 'stmui-theme-preview', 'aria-hidden': 'true' }, [
        h('span', { class: 'stmui-tp-bar' }, [h('span', { class: 'stmui-tp-dot' }), h('span', { class: 'stmui-tp-line' })]),
        h('span', { class: 'stmui-tp-msg stmui-tp-bot' }),
        h('span', { class: 'stmui-tp-msg stmui-tp-user' }),
        h('span', { class: 'stmui-tp-tabs' }, [h('span', { class: 'stmui-tp-pill' })]),
    ]);
    for (const [key, value] of Object.entries(colors)) preview.style.setProperty(`--p-${key}`, value);
    const selected = current === id;
    return h('button', {
        type: 'button',
        class: `stmui-theme-card ${selected ? 'stmui-theme-on' : ''}`,
        'aria-pressed': String(selected),
        'data-theme': id,
        onclick: event => setAppearance('theme', id, event.currentTarget),
    }, [
        preview,
        h('span', { class: 'stmui-theme-name' }, [
            h('span', { text: theme?.name ?? 'Your theme' }),
            selected ? h('span', { class: 'stmui-theme-check' }, [ui('check')]) : null,
        ]),
        h('span', { class: 'stmui-theme-note', text: theme?.note ?? 'Your SillyTavern colors' }),
    ]);
}

function switchRow(key, label, hint) {
    const input = h('input', { type: 'checkbox', class: 'stmui-switch', role: 'switch' });
    input.checked = !!settings[key];
    input.addEventListener('change', () => setAppearance(key, input.checked));
    return h('label', { class: 'stmui-switch-row' }, [
        h('span', { class: 'stmui-switch-text' }, [h('span', { text: label }), hint ? h('small', { text: hint }) : null]),
        input,
    ]);
}

function motionControl() {
    const names = { full: 'Smooth', light: 'Light', off: 'Off' };
    return h('div', { class: 'stmui-segmented stmui-motion-seg', role: 'group', 'aria-label': 'Animations' },
        Object.keys(names).map(level => h('button', {
            type: 'button',
            class: `stmui-seg ${settings.motion === level ? 'stmui-seg-on' : ''}`,
            'aria-pressed': String(settings.motion === level),
            onclick: () => setAppearance('motion', level),
        }, [names[level]])));
}

/** A row of choices for one setting, like Size or Message box. */
function choiceControl(key, names, label) {
    return h('div', { class: 'stmui-segmented stmui-look-seg', role: 'group', 'aria-label': label },
        Object.entries(names).map(([value, text]) => h('button', {
            type: 'button',
            class: `stmui-seg ${settings[key] === value ? 'stmui-seg-on' : ''}`,
            'aria-pressed': String(settings[key] === value),
            onclick: () => setAppearance(key, value),
        }, [text])));
}

function openThemeSheet() {
    showSheet(new MenuSheet({
        title: 'Themes',
        subtitle: 'Changes the look on your phone. Your SillyTavern theme stays saved.',
        fill: body => {
            body.append(h('div', { class: 'stmui-themes' }, [themeCard(null, settings.theme), ...THEMES.map(theme => themeCard(theme, settings.theme))]));
            body.append(h('p', { class: 'stmui-menu-heading', text: 'Look and feel' }));
            body.append(h('div', { class: 'stmui-menu-list' }, [
                switchRow('themeBackdrop', 'Theme background', 'Use the theme\'s backdrop instead of your chat background.'),
                switchRow('modernFont', 'Modern font', 'Your phone\'s own system font, crisp at every size.'),
                switchRow('customIcons', 'New icons', 'Rounded line icons everywhere.'),
            ]));
            body.append(h('p', { class: 'stmui-menu-heading', text: 'Chat look' }));
            body.append(chatLookControl());
            body.append(h('p', { class: 'stmui-menu-heading', text: 'Size' }));
            body.append(choiceControl('uiSize', SIZES, 'Size'));
            body.append(h('p', { class: 'stmui-menu-foot', text: SIZE_NOTES[settings.uiSize] ?? '' }));
            body.append(h('p', { class: 'stmui-menu-heading', text: 'Message box' }));
            body.append(choiceControl('composerStyle', COMPOSER_STYLES, 'Message box'));
            body.append(h('p', { class: 'stmui-menu-foot', text: COMPOSER_NOTES[settings.composerStyle] ?? '' }));
            body.append(h('p', { class: 'stmui-menu-heading', text: 'Animations' }));
            body.append(motionControl());
            body.append(h('p', { class: 'stmui-menu-foot', text: MOTION_LABELS[settings.motion] }));
        },
    }));
}

// -------------------------------------------------- long single selects

/**
 * Optional: any big single-choice dropdown (presets, themes, models…) gets the
 * same searchable sheet. Off by default because the native Android list is fine
 * for short menus and some extensions manage their own selects.
 */
function labelForSelect(select) {
    const clean = text => (text ?? '').replace(/\s+/g, ' ').trim();
    const explicit = select.id ? document.querySelector(`label[for="${CSS.escape(select.id)}"]`) : null;
    const direct = clean(select.getAttribute('aria-label')) || clean(explicit?.textContent);
    if (direct) return direct;
    // Nearest short heading-like element right before the control, a few levels up.
    let node = select;
    for (let depth = 0; depth < 3 && node && node !== document.body; depth++, node = node.parentElement) {
        const previous = node.previousElementSibling;
        const text = clean(previous?.textContent);
        if (previous && text && text.length <= 60 && !previous.querySelector('select, input, textarea')) return text;
    }
    const fromId = (select.id || '').replace(/_?select$/, '').replace(/[_-]+/g, ' ').trim();
    return fromId ? fromId.charAt(0).toUpperCase() + fromId.slice(1) : 'Choose an option';
}

function longSelectConfig(select) {
    const label = labelForSelect(select);
    return {
        selector: '*',
        kind: 'single',
        title: label,
        subtitle: '',
        noneLabel: 'None',
        searchLabel: 'Search',
        noun: 'option',
    };
}

// ------------------------------------------------------------------ scan

function matchTarget(select) {
    if (select.closest('.template_element, #character_world_template, #stmui-sheet')) return null;
    for (const target of LOREBOOK_TARGETS) {
        if (select.matches(target.selector)) return target;
    }
    return null;
}

function scan() {
    scanTimer = 0;
    for (const [select, picker] of pickers) {
        const wanted = picker.isLong ? settings.longSelects : settings.lorebookPicker;
        if (!select.isConnected || !active || !wanted) {
            picker.destroy();
            pickers.delete(select);
        }
    }
    if (!active) return;

    if (settings.lorebookPicker) {
        const selector = LOREBOOK_TARGETS.map(target => target.selector).join(',');
        for (const select of document.querySelectorAll(selector)) {
            if (pickers.has(select) || !(select instanceof HTMLSelectElement)) continue;
            const target = matchTarget(select);
            if (target) pickers.set(select, new Picker(select, target));
        }
    }

    if (settings.longSelects) {
        for (const select of document.querySelectorAll('select:not([multiple])')) {
            if (pickers.has(select) || select.matches(LONG_SELECT_EXCLUDE)) continue;
            if (select.closest('#stmui-sheet, .stmui-settings') || select.options.length < LONG_SELECT_MIN_OPTIONS) continue;
            pickers.set(select, new Picker(select, longSelectConfig(select)));
        }
    }
}

function scheduleScan() {
    if (scanTimer) return;
    scanTimer = window.setTimeout(scan, 120);
}

function startObserver() {
    if (domObserver) return;
    const selector = LOREBOOK_TARGETS.map(target => target.selector).join(',') + (settings.longSelects ? ',select' : '');
    domObserver = new MutationObserver(records => {
        let rescan = false;
        let layers = false;
        let editorChanged = false;
        for (const record of records) {
            if (record.target === document.body) layers = true;
            if (rescan) continue;
            if (!editorChanged) {
                for (const node of [...record.addedNodes, ...record.removedNodes]) {
                    if (node.nodeType === 1 && (node.id === 'curEditTextarea' || node.querySelector?.('#curEditTextarea'))) {
                        editorChanged = true;
                        break;
                    }
                }
            }
            for (const node of record.addedNodes) {
                if (node.nodeType !== 1 || node.closest?.('#chat')) continue;
                if (node.matches?.(selector) || node.querySelector?.(selector)) {
                    rescan = true;
                    break;
                }
            }
            if (!rescan && settings.longSelects && record.target instanceof HTMLSelectElement && record.addedNodes.length && !pickers.has(record.target)) {
                rescan = true;
            }
            if (!rescan && record.removedNodes.length && pickers.size) {
                for (const select of pickers.keys()) {
                    if (!select.isConnected) {
                        rescan = true;
                        break;
                    }
                }
            }
        }
        if (rescan) scheduleScan();
        // SillyTavern popups are <dialog>s appended to and removed from <body>.
        if (layers) scheduleHistorySync();
        if (editorChanged) syncEditorState();
    });
    domObserver.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
    domObserver?.disconnect();
    domObserver = null;
    window.clearTimeout(scanTimer);
    scanTimer = 0;
}

// ------------------------------------------------------------- wand entry

function syncWandShortcut() {
    const existing = document.getElementById('stmui_wand_container');
    const want = active && settings.wandShortcut && settings.lorebookPicker;
    if (!want) {
        existing?.remove();
        return;
    }
    if (existing) return;
    const menu = document.getElementById('extensionsMenu');
    if (!menu) return;
    const item = h('div', {
        id: 'stmui_wand_lorebooks',
        class: 'list-group-item flex-container flexGap5 interactable',
        tabindex: '0',
        role: 'button',
        title: 'Choose which lorebooks are active in all chats',
        onclick: () => {
            const select = document.querySelector('#world_info');
            const picker = select && pickers.get(select);
            // SillyTavern closes the wand menu itself when a menu item is clicked.
            if (picker) openSheet(picker);
        },
    }, [h('div', { class: 'fa-solid fa-book-atlas extensionsMenuExtensionButton' }), h('span', { text: 'Lorebooks' })]);
    menu.append(h('div', { id: 'stmui_wand_container', class: 'extension_container' }, [item]));
    const button = document.getElementById('extensionsMenuButton');
    if (button) button.style.display = '';
}

// ---------------------------------------------------------- phone extras

const extras = {
    wired: false,
    jump: null,
    jumpFrame: 0,
    formObserver: null,
    wakeLock: null,
    generating: false,
    wakeTimer: 0,
    draftTimer: 0,
    draftKey: null,
    personaObserver: null,
};

function motionAllowed() {
    return settings.motion !== 'off' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** A short vibration. Android only allows it right after a tap. */
function buzz(pattern = 10) {
    // Chrome logs an error for vibrate() without a real tap (for example a scripted click).
    if (active && settings.haptics && navigator.userActivation?.isActive !== false) {
        try {
            navigator.vibrate?.(pattern);
        } catch {
            // Not allowed here; nothing to do.
        }
    }
}

/**
 * The send animation runs on its own layer above the button: SillyTavern hides
 * the button as soon as the reply starts, which would cut an animation on it short.
 */
function playSendFx(button) {
    if (!active || !settings.sendEffect || !settings.chatStyle || !motionAllowed()) return;
    const rect = button.getBoundingClientRect();
    if (!rect.width) return;
    const light = settings.motion === 'light';
    const fx = h('div', { class: `stmui-send-fx${light ? ' stmui-send-fx-light' : ''}`, 'aria-hidden': 'true' }, [
        h('span', { class: 'stmui-send-ring' }),
        light ? null : h('span', { class: 'stmui-send-ring stmui-send-ring-2' }),
        ...(light ? [] : Array.from({ length: 6 }, (_, i) => h('span', { class: 'stmui-send-spark', style: `--i: ${i}` }))),
        h('span', { class: 'stmui-send-plane' }, [svgIcon('send')]),
    ]);
    fx.style.left = `${rect.left + rect.width / 2}px`;
    fx.style.top = `${rect.top + rect.height / 2}px`;
    document.body.append(fx);
    button.classList.remove('stmui-launch');
    void button.offsetWidth;
    button.classList.add('stmui-launch');
    setTimeout(() => {
        fx.remove();
        button.classList.remove('stmui-launch');
    }, 900);
}

function onSendPointerDown(event) {
    if (!active || event.button > 0) return;
    if (event.target.closest?.('#send_but')) buzz(12);
}

function onSendClick(event) {
    if (!active) return;
    const button = event.target.closest?.('#send_but');
    if (button) playSendFx(button);
}

// -- jump to latest

function onChatScroll() {
    if (extras.jumpFrame) return;
    extras.jumpFrame = requestAnimationFrame(() => {
        extras.jumpFrame = 0;
        const chat = document.getElementById('chat');
        if (!chat || !extras.jump) return;
        const distance = chat.scrollHeight - chat.scrollTop - chat.clientHeight;
        extras.atBottom = distance < 40;
        // Not on the start screen: there is no "latest message" there, and it covered the chat list.
        // (No chat open = the start screen; cheaper than searching a long chat on every frame.)
        const welcome = ctx().getCurrentChatId?.() === undefined;
        extras.jump.classList.toggle('stmui-jump-on', !welcome && (distance > Math.max(320, chat.clientHeight * 0.7) || (extras.generating && distance > 150)));
        // While a reply streams in below, the button says so.
        extras.jump.classList.toggle('stmui-jump-new', extras.generating && distance > 150);
    });
}

function syncJumpButton() {
    const chat = document.getElementById('chat');
    const sheld = document.getElementById('sheld');
    const want = active && settings.jumpButton && chat && sheld;
    if (!want) {
        extras.jump?.remove();
        extras.jump = null;
        chat?.removeEventListener('scroll', onChatScroll);
        cancelAnimationFrame(extras.jumpFrame);
        extras.jumpFrame = 0;
        return;
    }
    if (extras.jump) return;
    extras.jump = h('button', {
        type: 'button',
        class: 'stmui-jump',
        'aria-label': 'Jump to the latest message',
        title: 'Latest message',
        onclick: () => {
            buzz(8);
            chat.scrollTo({ top: chat.scrollHeight, behavior: motionAllowed() ? 'smooth' : 'auto' });
        },
    }, [ui('arrow-down'), h('span', { class: 'stmui-jump-label', text: 'New text' })]);
    shieldFromDrawerAutoClose(extras.jump);
    sheld.append(extras.jump);
    chat.addEventListener('scroll', onChatScroll, { passive: true });
    onChatScroll();
}

// -- drafts

function draftKeyNow() {
    const context = ctx();
    const chatId = context.getCurrentChatId?.() ?? context.chatId;
    if (!chatId) return null;
    const owner = context.groupId ? `g:${context.groupId}` : (context.characterId !== undefined ? `c:${context.characters?.[context.characterId]?.avatar ?? context.characterId}` : null);
    return owner ? `stmui_draft:${owner}:${chatId}` : null;
}

function readDraft(key) {
    try {
        return key ? localStorage.getItem(key) : null;
    } catch {
        return null;
    }
}

function writeDraft(key, value) {
    if (!key) return;
    try {
        if (value && value.trim()) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
    } catch {
        // Storage full or blocked: drafts are a convenience only.
    }
}

/**
 * Opening a chat made SillyTavern focus the message box, which pops up the
 * keyboard. For a short while after a chat opens, the box only takes focus
 * when you tapped it yourself.
 */
const focusGuard = { until: 0, tapped: 0, target: null, at: 0 };

/** Where SillyTavern (and Pocket Tavern) put text you edit. */
const EDIT_AREAS = '#chat, #WorldInfo, #world_popup, #completion_prompt_manager_popup, #persona-management-block, #rm_ch_create_block, #stmui-sheet';

function guardKeyboard(ms = 2500) {
    focusGuard.until = Date.now() + ms;
}

function onFocusGuardPointer(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    focusGuard.target = target;
    focusGuard.at = Date.now();
    if (target.closest('#send_form')) focusGuard.tapped = Date.now();
    // Opening a chat from a list: the focus that follows is not yours.
    else if (target.closest('.recentChat, .stmui-group-main, .character_select, .group_select, .select_chat_block, .stmui-choice, .stmui-search-hit')) guardKeyboard(3500);
}

function onFocusGuardFocus(event) {
    const box = event.target;
    if (!active || !(box instanceof HTMLTextAreaElement)) return;
    const now = Date.now();
    if (box.id === 'send_textarea') {
        if (now < focusGuard.until && now - focusGuard.tapped > 1200) box.blur();
        return;
    }
    // Any other text box (editing a message, its thinking, a persona, a lorebook
    // entry...): when it took focus right after you tapped something else, like
    // ✎ Edit, keep the keyboard down. Tap the box itself to type.
    // Only real edit areas: SillyTavern's copy trick focuses a short-lived box of its own and must keep working.
    if (!box.closest(EDIT_AREAS)) return;
    const tappedElsewhere = focusGuard.target && now - focusGuard.at < 1500 && !box.contains(focusGuard.target);
    if (tappedElsewhere) box.blur();
}

function onDraftInput(event) {
    if (!active || !settings.saveDrafts || event.target?.id !== 'send_textarea') return;
    window.clearTimeout(extras.draftTimer);
    const value = event.target.value;
    const key = extras.draftKey ?? draftKeyNow();
    extras.draftTimer = window.setTimeout(() => writeDraft(key, value), 400);
}

/** Called when the chat changes: put away the old chat's draft and bring back this one's. */
function restoreDraft() {
    if (!active || !settings.saveDrafts) return;
    const textarea = document.getElementById('send_textarea');
    if (!textarea) return;
    window.clearTimeout(extras.draftTimer);
    const previous = extras.draftKey;
    const next = draftKeyNow();
    extras.draftKey = next;
    if (previous && previous === next) return;
    let changed = false;
    const current = textarea.value;
    if (current.trim()) {
        if (previous) writeDraft(previous, current);
        // SillyTavern keeps one copy of the box across reloads; if that text is
        // another chat's draft, it stays saved there instead of following you here.
        const owner = previous || draftKeyWithText(current, next);
        if (owner && owner !== next && readDraft(owner) === current) {
            textarea.value = '';
            changed = true;
        }
    }
    const saved = readDraft(next);
    if (saved && !textarea.value.trim()) {
        textarea.value = saved;
        changed = true;
    }
    // Let SillyTavern resize the box and update its own saved copy.
    if (changed) textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function draftKeyWithText(text, except) {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('stmui_draft:') && key !== except && localStorage.getItem(key) === text) return key;
        }
    } catch {
        // Storage blocked.
    }
    return null;
}

function clearDraft() {
    window.clearTimeout(extras.draftTimer);
    writeDraft(extras.draftKey ?? draftKeyNow(), '');
}

// -- keep the screen on while a reply streams in

async function setAwake(on) {
    window.clearTimeout(extras.wakeTimer);
    if (!on) {
        const lock = extras.wakeLock;
        extras.wakeLock = null;
        lock?.release?.().catch(() => {});
        return;
    }
    if (!active || !settings.keepAwake || extras.wakeLock || !navigator.wakeLock || document.visibilityState !== 'visible') return;
    try {
        const lock = await navigator.wakeLock.request('screen');
        extras.wakeLock = lock;
        lock.addEventListener('release', () => {
            if (extras.wakeLock === lock) extras.wakeLock = null;
        });
        // Never hold the screen on forever if an end event goes missing.
        extras.wakeTimer = window.setTimeout(() => setAwake(false), 10 * 60 * 1000);
    } catch {
        // Not allowed (battery saver, insecure page): just skip it.
    }
}

function onGenerating(on) {
    extras.generating = on;
    onChatScroll();
    setAwake(on);
}

function onVisibility() {
    // Android drops the lock when you leave the tab; take it back on return.
    if (document.visibilityState === 'visible' && extras.generating) setAwake(true);
}

// -- message menu

const MESSAGE_ACTION_ORDER = ['mes_copy', 'mes_edit', 'mes_swipe_picker', 'mes_create_branch', 'mes_create_bookmark', 'mes_hide', 'mes_unhide', 'mes_translate', 'mes_narrate', 'sd_message_gen', 'mes_embed', 'mes_prompt'];

function messageActionLabel(button) {
    const title = (button.getAttribute('title') || '').split('\n')[0].trim();
    if (title) return title;
    if (button.classList.contains('mes_bookmark')) return 'Open checkpoint';
    return 'Action';
}

/**
 * In edit mode SillyTavern's ⧉ button duplicates the message, and the copy lands
 * below a long message, off screen, so it looks like nothing happened. Ask which
 * one you meant: copy the text, or duplicate the message.
 */
let passEditCopy = false;

function onEditCopyClick(event) {
    if (!active || !settings.messageMenu) return;
    const button = event.target.closest?.('#chat .mes_edit_copy');
    if (!button) return;
    if (passEditCopy) {
        passEditCopy = false;
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    buzz(8);
    const message = button.closest('.mes');
    const textOf = () => message?.querySelector('.edit_textarea, #curEditTextarea')?.value ?? '';
    showSheet(new MenuSheet({
        title: 'Copy',
        subtitle: 'What would you like to do?',
        fill: body => body.append(h('div', { class: 'stmui-menu-list' }, [
            h('button', {
                type: 'button',
                class: 'stmui-menu-row',
                onclick: async () => {
                    const text = textOf();
                    closeSheet(true);
                    const ok = await copyText(text);
                    if (ok) globalThis.toastr?.success(t('Text copied.'), '', { timeOut: 2000 });
                    else globalThis.toastr?.error(t('Your browser blocked copying. Select the text and copy it instead.'), t('Could not copy'));
                },
            }, [ui('copy', 'stmui-menu-row-icon'), h('span', { class: 'stmui-row-text' }, [
                h('span', { text: 'Copy text' }),
                h('small', { text: 'Put the message text on the clipboard.' }),
            ])]),
            h('button', {
                type: 'button',
                class: 'stmui-menu-row',
                onclick: () => {
                    closeSheet(true);
                    const count = ctx().chat?.length ?? 0;
                    passEditCopy = true;
                    button.click();
                    // Say where the copy went once SillyTavern has added it.
                    const check = (tries = 0) => {
                        if ((ctx().chat?.length ?? 0) > count) globalThis.toastr?.success(t('A copy of the message was added right below it.'), '', { timeOut: 3000 });
                        else if (tries < 40) setTimeout(() => check(tries + 1), 250);
                    };
                    check();
                },
            }, [ui('file-plus', 'stmui-menu-row-icon'), h('span', { class: 'stmui-row-text' }, [
                h('span', { text: 'Duplicate message' }),
                h('small', { text: 'Add a second copy of this message to the chat, right below it.' }),
            ])]),
        ])),
    }));
}

function onMessageMenuClick(event) {
    if (!active || !settings.messageMenu) return;
    const hint = event.target.closest?.('#chat .extraMesButtonsHint');
    if (!hint) return;
    const message = hint.closest('.mes');
    if (!message) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    buzz(8);
    openMessageMenu(message);
}

/**
 * Copies text even where the browser has no clipboard API: SillyTavern opened by a
 * network address (http://192.168...) is not a "secure" page, so Chrome hides it.
 */
function copyWithFallback(text) {
    const area = h('textarea', { readonly: '', 'aria-hidden': 'true' });
    area.value = text;
    // Off screen, 16px so Android does not zoom, inside any open dialog so it can be focused.
    area.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;font-size:16px;';
    (document.querySelector('dialog[open]:last-of-type') ?? document.body).append(area);
    area.focus({ preventScroll: true });
    area.select();
    area.setSelectionRange(0, text.length);
    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch {
        ok = false;
    }
    area.remove();
    return ok;
}

async function copyText(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Permission refused: try the old way below.
        }
    }
    return copyWithFallback(text);
}

/** SillyTavern's own Copy reads the raw message text; do the same. */
async function copyMessage(message) {
    const id = Number(message.getAttribute('mesid'));
    const text = ctx().chat?.[id]?.mes ?? message.querySelector('.mes_text')?.innerText ?? '';
    const ok = await copyText(text);
    if (ok) globalThis.toastr?.success(t('Message copied.'), '', { timeOut: 2000 });
    else globalThis.toastr?.error(t('Your browser blocked copying. Long-press the text to copy it instead.'), t('Could not copy'));
}

/**
 * Without a secure page there is no navigator.clipboard at all, so every copy
 * button in SillyTavern fails quietly. Give it one that uses the old method.
 */
function patchClipboard() {
    if (navigator.clipboard || window.isSecureContext) return;
    try {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                stmui: true,
                writeText: text => (copyWithFallback(String(text)) ? Promise.resolve() : Promise.reject(new Error('Copy failed'))),
            },
        });
    } catch {
        // Read-only in this browser; our own Copy still works.
    }
}

function openMessageMenu(message) {
    const name = message.getAttribute('ch_name') || 'Message';
    const preview = (message.querySelector('.mes_text')?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const run = button => {
        closeSheet(true);
        if (button.classList.contains('mes_copy')) {
            copyMessage(message);
            return;
        }
        // Some SillyTavern buttons listen for pointerup rather than click; send both.
        button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: true }));
        button.click();
    };
    showSheet(new MenuSheet({
        title: name,
        subtitle: preview.length > 90 ? `${preview.slice(0, 90)}…` : preview,
        fill: body => {
            if (!message.isConnected) {
                body.append(h('p', { class: 'stmui-menu-foot', text: 'This message is no longer in the chat.' }));
                return;
            }
            const buttons = Array.from(message.querySelectorAll('.mes_buttons .mes_button'))
                .filter(button => !button.classList.contains('extraMesButtonsHint') && getComputedStyle(button).display !== 'none');
            const rank = button => {
                const index = MESSAGE_ACTION_ORDER.findIndex(name => button.classList.contains(name));
                return index === -1 ? 50 : index;
            };
            buttons.sort((a, b) => rank(a) - rank(b));
            const rows = buttons.map(button => {
                const faClass = Array.from(button.classList).find(name => name.startsWith('fa-') && !['fa-solid', 'fa-regular', 'fa-fw', 'fa-xs', 'fa-sm', 'fa-lg'].includes(name));
                return h('button', { type: 'button', class: 'stmui-menu-row', onclick: () => run(button) }, [
                    faClass ? ui(faClass, 'stmui-menu-row-icon') : ui('puzzle', 'stmui-menu-row-icon'),
                    h('span', { text: messageActionLabel(button) }),
                ]);
            });
            const edit = message.querySelector('.mes_edit');
            if (edit && getComputedStyle(edit).display !== 'none') {
                rows.push(h('button', {
                    type: 'button',
                    class: 'stmui-menu-row stmui-menu-row-danger',
                    onclick: () => {
                        closeSheet(true);
                        // SillyTavern deletes from edit mode and asks to confirm first.
                        edit.click();
                        setTimeout(() => message.querySelector('.mes_edit_delete')?.click(), 120);
                    },
                }, [ui('trash', 'stmui-menu-row-icon'), h('span', { text: 'Delete message' })]));
            }
            body.append(h('div', { class: 'stmui-menu-list' }, rows));
        },
    }));
}

// -- personas: list and editor on separate tabs

function syncPersonaTabs() {
    const block = document.getElementById('persona-management-block');
    let bar = document.getElementById('stmui_persona_tabs');
    const want = active && settings.touchSizing && block;
    if (!want) {
        bar?.remove();
        document.querySelector('#persona_controls .stmui-persona-face')?.remove();
        block?.classList.remove('stmui-persona-split', 'stmui-persona-edit');
        extras.personaObserver?.disconnect();
        extras.personaObserver = null;
        return;
    }
    if (!bar) {
        const tab = (mode, iconName, label) => h('button', {
            type: 'button',
            class: 'stmui-seg',
            'data-mode': mode,
            onclick: () => {
                block.classList.toggle('stmui-persona-edit', mode === 'edit');
                updatePersonaTabs();
                block.closest('.drawer-content')?.scrollTo?.({ top: 0 });
            },
        }, [ui(iconName), h('span', { class: 'stmui-seg-text', text: label })]);
        bar = h('div', { id: 'stmui_persona_tabs', class: 'stmui-segmented stmui-persona-tabs', role: 'tablist' }, [
            tab('list', 'users', 'All personas'),
            tab('edit', 'pencil', 'Edit current'),
        ]);
        block.before(bar);
        block.classList.add('stmui-persona-split');
        // The list re-renders when you pick someone, and the name changes with it.
        extras.personaObserver = new MutationObserver(updatePersonaTabs);
        const name = document.getElementById('your_name');
        const list = document.getElementById('user_avatar_block');
        if (name) extras.personaObserver.observe(name, { childList: true, characterData: true, subtree: true });
        if (list) extras.personaObserver.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    updatePersonaTabs();
}

function updatePersonaTabs() {
    const block = document.getElementById('persona-management-block');
    const bar = document.getElementById('stmui_persona_tabs');
    if (!block || !bar) return;
    const editing = block.classList.contains('stmui-persona-edit');
    const name = document.getElementById('your_name')?.textContent?.trim();
    for (const button of bar.querySelectorAll('.stmui-seg')) {
        const on = (button.dataset.mode === 'edit') === editing;
        button.classList.toggle('stmui-seg-on', on);
        button.setAttribute('aria-selected', String(on));
        if (button.dataset.mode === 'edit') {
            const label = name && name !== '[Persona Name]' ? t('Edit {name}', { name }) : t('Edit current');
            const text = button.querySelector('.stmui-seg-text');
            if (text.textContent !== label) text.textContent = label;
        }
    }
    // The current persona's picture next to its name.
    const controls = document.getElementById('persona_controls');
    const src = document.querySelector('#user_avatar_block .avatar-container.selected img')?.getAttribute('src');
    if (controls) {
        let face = controls.querySelector('.stmui-persona-face');
        if (!face) {
            face = h('span', { class: 'stmui-persona-face', 'aria-hidden': 'true' }, [h('img', { alt: '' })]);
            controls.prepend(face);
        }
        const img = face.querySelector('img');
        face.hidden = !src;
        if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
    }
}

// -- notifications: swipe one sideways to dismiss it

const toastSwipe = { el: null, x: 0, dx: 0 };

function onToastTouchStart(event) {
    if (!active || !settings.niceToasts) return;
    const toast = event.target.closest?.('#toast-container > .toast');
    if (!toast || event.touches.length !== 1) return;
    toastSwipe.el = toast;
    toastSwipe.x = event.touches[0].clientX;
    toastSwipe.dx = 0;
    toast.style.transition = 'none';
}

function onToastTouchMove(event) {
    const toast = toastSwipe.el;
    if (!toast) return;
    toastSwipe.dx = event.touches[0].clientX - toastSwipe.x;
    toast.style.transform = `translateX(${toastSwipe.dx}px)`;
    toast.style.opacity = String(Math.max(0.2, 1 - Math.abs(toastSwipe.dx) / 260));
}

function onToastTouchEnd() {
    const toast = toastSwipe.el;
    if (!toast) return;
    toastSwipe.el = null;
    toast.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
    if (Math.abs(toastSwipe.dx) > 80) {
        toast.style.transform = `translateX(${toastSwipe.dx > 0 ? 120 : -120}%)`;
        toast.style.opacity = '0';
        setTimeout(() => {
            const toastr = globalThis.toastr;
            if (toastr?.clear) toastr.clear($j()(toast), { force: true });
            else toast.remove();
        }, 200);
    } else {
        toast.style.transform = '';
        toast.style.opacity = '';
    }
}

// -- picture viewer for chat avatars

let viewer = null;

/** The full-size picture behind a chat thumbnail, where SillyTavern serves one. */
function fullImageUrl(thumb) {
    try {
        const url = new URL(thumb, location.href);
        if (url.pathname.endsWith('/thumbnail')) {
            const file = url.searchParams.get('file');
            const type = url.searchParams.get('type');
            if (file && type === 'avatar') return `/characters/${encodeURIComponent(file)}`;
            if (file && type === 'persona') return `/User Avatars/${encodeURIComponent(file)}`;
        }
    } catch {
        // Not a URL we understand; use it as is.
    }
    return thumb;
}

function onAvatarClick(event) {
    if (!active || !settings.imageViewer) return;
    const avatar = event.target.closest?.('#chat .mes .avatar');
    const img = avatar?.querySelector('img');
    if (!img?.getAttribute('src')) return;
    // Stop SillyTavern's small floating window from opening as well.
    event.preventDefault();
    event.stopImmediatePropagation();
    buzz(8);
    const message = avatar.closest('.mes');
    const shown = img.getAttribute('src');
    // Sharp pictures put a small scaled copy (a blob: URL) in the avatar; the
    // thumbnail SillyTavern asked for still tells us which original to open.
    const source = shown.startsWith('blob:') && img.dataset.stmuiThumb ? img.dataset.stmuiThumb : shown;
    openViewer({
        thumb: shown,
        full: fullImageUrl(source),
        title: message?.getAttribute('ch_name') || 'Picture',
    });
}

class Viewer {
    constructor({ thumb, full, title }) {
        this.full = full;
        this.title = title;
        this.closing = false;
        this.state = { scale: 1, x: 0, y: 0, rot: 0 };
        this.pointers = new Map();
        this.lastTap = { t: 0, x: 0, y: 0 };
        this.tapTimer = 0;

        this.img = h('img', { class: 'stmui-viewer-img', alt: title, draggable: 'false', src: thumb });
        if (full && full !== thumb) {
            const loader = new Image();
            loader.onload = () => {
                if (!this.closing) this.img.src = full;
            };
            loader.src = full;
        }
        const button = (iconName, label, onclick, extra = '') => h('button', {
            type: 'button', class: `stmui-viewer-btn ${extra}`, 'aria-label': label, title: label, onclick,
        }, [ui(iconName)]);
        this.zoomButton = button('zoom-in', 'Zoom in', () => this.toggleZoom());
        this.stage = h('div', { class: 'stmui-viewer-stage' }, [this.img]);
        this.dialog = h('dialog', { class: 'stmui-viewer', 'aria-label': title }, [
            h('div', { class: 'stmui-viewer-top' }, [
                h('span', { class: 'stmui-viewer-title', text: title }),
                button('x', 'Close', () => closeViewer(), 'stmui-viewer-close'),
            ]),
            this.stage,
            h('div', { class: 'stmui-viewer-bar' }, [
                this.zoomButton,
                button('rotate-cw', 'Rotate', () => this.rotate()),
                button('external', 'Open full size', () => window.open(this.full, '_blank', 'noopener')),
                button('download', 'Save picture', () => this.download()),
            ]),
        ]);
        shieldFromDrawerAutoClose(this.dialog);
        this.dialog.addEventListener('cancel', event => {
            event.preventDefault();
            closeViewer();
        });
        this.stage.addEventListener('pointerdown', event => this.down(event));
        this.stage.addEventListener('pointermove', event => this.move(event));
        for (const type of ['pointerup', 'pointercancel', 'pointerleave']) this.stage.addEventListener(type, event => this.up(event));
        this.stage.addEventListener('wheel', event => {
            event.preventDefault();
            this.zoomAt(this.state.scale * (event.deltaY < 0 ? 1.2 : 1 / 1.2), event.clientX, event.clientY);
        }, { passive: false });
    }

    center() {
        const rect = this.stage.getBoundingClientRect();
        return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
    }

    apply(animate = false) {
        const { scale, x, y, rot } = this.state;
        this.img.style.transition = animate ? 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
        this.img.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rot}deg)`;
        this.dialog.classList.toggle('stmui-viewer-zoomed', scale > 1.01);
        const icon = scale > 1.01 ? 'zoom-out' : 'zoom-in';
        if (this.zoomButton.dataset.icon !== icon) {
            this.zoomButton.dataset.icon = icon;
            this.zoomButton.replaceChildren(ui(icon));
            this.zoomButton.setAttribute('aria-label', scale > 1.01 ? 'Zoom out' : 'Zoom in');
        }
    }

    /** Keeps the picture from being dragged off screen. */
    clamp() {
        const { scale } = this.state;
        const width = this.img.offsetWidth * scale;
        const height = this.img.offsetHeight * scale;
        const rect = this.stage.getBoundingClientRect();
        const maxX = Math.max(0, (width - rect.width) / 2);
        const maxY = Math.max(0, (height - rect.height) / 2);
        this.state.x = Math.min(maxX, Math.max(-maxX, this.state.x));
        this.state.y = Math.min(maxY, Math.max(-maxY, this.state.y));
    }

    zoomAt(next, px, py, animate = false) {
        const scale = Math.min(6, Math.max(1, next));
        const { cx, cy } = this.center();
        // Keep the point under the finger in place while the scale changes.
        const qx = (px - cx - this.state.x) / this.state.scale;
        const qy = (py - cy - this.state.y) / this.state.scale;
        this.state.x = px - cx - scale * qx;
        this.state.y = py - cy - scale * qy;
        this.state.scale = scale;
        if (scale === 1) {
            this.state.x = 0;
            this.state.y = 0;
        }
        this.clamp();
        this.apply(animate);
    }

    toggleZoom(px, py) {
        const { cx, cy } = this.center();
        if (this.state.scale > 1.01) this.zoomAt(1, cx, cy, true);
        else this.zoomAt(2.5, px ?? cx, py ?? cy, true);
    }

    rotate() {
        this.state.rot += 90;
        this.state.scale = 1;
        this.state.x = 0;
        this.state.y = 0;
        this.apply(true);
    }

    download() {
        const name = `${this.title.replace(/[\\/:*?"<>|]+/g, '_') || 'picture'}.png`;
        const link = h('a', { href: this.full, download: name });
        document.body.append(link);
        link.click();
        link.remove();
    }

    down(event) {
        try {
            this.stage.setPointerCapture?.(event.pointerId);
        } catch {
            // The pointer is already gone; carry on without capture.
        }
        this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        this.moved = false;
        if (this.pointers.size === 2) {
            const [a, b] = [...this.pointers.values()];
            this.pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: this.state.scale };
        } else if (this.pointers.size === 1) {
            this.drag = { x: event.clientX, y: event.clientY, sx: this.state.x, sy: this.state.y };
            this.dismissY = 0;
        }
    }

    move(event) {
        if (!this.pointers.has(event.pointerId)) return;
        this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (this.pointers.size === 2 && this.pinch) {
            const [a, b] = [...this.pointers.values()];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            this.moved = true;
            this.zoomAt(this.pinch.scale * (dist / this.pinch.dist), (a.x + b.x) / 2, (a.y + b.y) / 2);
            return;
        }
        if (this.pointers.size !== 1 || !this.drag) return;
        const dx = event.clientX - this.drag.x;
        const dy = event.clientY - this.drag.y;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) this.moved = true;
        if (this.state.scale > 1.01) {
            this.state.x = this.drag.sx + dx;
            this.state.y = this.drag.sy + dy;
            this.clamp();
            this.apply();
        } else if (dy > 0) {
            // Pull down to close, like a photo app.
            this.dismissY = dy;
            this.img.style.transition = 'none';
            this.img.style.transform = `translate(0, ${dy}px) scale(${1 - Math.min(dy, 300) / 1500}) rotate(${this.state.rot}deg)`;
            this.dialog.style.setProperty('--stmui-viewer-fade', String(Math.max(0, 1 - dy / 350)));
        }
    }

    up(event) {
        if (!this.pointers.has(event.pointerId)) return;
        this.pointers.delete(event.pointerId);
        if (this.pointers.size < 2) this.pinch = null;
        if (this.pointers.size) return;
        this.drag = null;
        if (this.dismissY > 110) {
            closeViewer();
            return;
        }
        if (this.dismissY) {
            this.dismissY = 0;
            this.dialog.style.removeProperty('--stmui-viewer-fade');
            this.apply(true);
            return;
        }
        if (this.moved || event.type !== 'pointerup') return;
        // Double tap zooms in on that spot; a single tap shows or hides the buttons.
        const now = Date.now();
        const near = Math.hypot(event.clientX - this.lastTap.x, event.clientY - this.lastTap.y) < 30;
        if (now - this.lastTap.t < 300 && near) {
            window.clearTimeout(this.tapTimer);
            this.lastTap.t = 0;
            this.toggleZoom(event.clientX, event.clientY);
            return;
        }
        this.lastTap = { t: now, x: event.clientX, y: event.clientY };
        this.tapTimer = window.setTimeout(() => this.dialog.classList.toggle('stmui-viewer-bare'), 300);
    }
}

function openViewer(options) {
    closeViewer(true);
    viewer = new Viewer(options);
    document.body.append(viewer.dialog);
    viewer.dialog.showModal();
    requestAnimationFrame(() => viewer?.dialog.classList.add('stmui-viewer-open'));
    scheduleHistorySync();
}

function closeViewer(immediate = false) {
    const current = viewer;
    if (!current || current.closing) return;
    current.closing = true;
    viewer = null;
    window.clearTimeout(current.tapTimer);
    const finish = () => {
        if (current.dialog.open) current.dialog.close();
        current.dialog.remove();
    };
    if (immediate) finish();
    else {
        current.dialog.style.pointerEvents = 'none';
        current.dialog.classList.remove('stmui-viewer-open');
        setTimeout(finish, 220);
    }
    scheduleHistorySync();
}

// -- translate the chat

/**
 * Uses SillyTavern's built-in Chat Translation (Google Translate through the
 * SillyTavern server by default, no key needed). The original text is never
 * changed: translations are shown on top, like SillyTavern's own feature, but
 * several messages are translated at once, newest first, so it feels instant.
 */
const translation = { running: false, cancel: false, status: null };
const TRANSLATE_WORKERS = 4;
const FALLBACK_LANGUAGES = [
    ['ar', 'Arabic'], ['zh-CN', 'Chinese (Simplified)'], ['nl', 'Dutch'], ['en', 'English'], ['fr', 'French'], ['de', 'German'],
    ['hi', 'Hindi'], ['id', 'Indonesian'], ['it', 'Italian'], ['ja', 'Japanese'], ['ko', 'Korean'], ['pl', 'Polish'],
    ['pt', 'Portuguese'], ['ru', 'Russian'], ['es', 'Spanish'], ['th', 'Thai'], ['tr', 'Turkish'], ['uk', 'Ukrainian'], ['vi', 'Vietnamese'],
];

async function translatorModule() {
    if (ctx().extensionSettings?.disabledExtensions?.includes('translate')) return null;
    try {
        const module = await import('/scripts/extensions/translate/index.js');
        return typeof module.translate === 'function' ? module : null;
    } catch {
        return null;
    }
}

function translateSettings() {
    return ctx().extensionSettings?.translate ?? null;
}

function languageOptions() {
    const select = document.getElementById('translation_target_language');
    if (select?.options.length) return Array.from(select.options).map(option => ({ value: option.value, label: option.textContent.trim() }));
    return FALLBACK_LANGUAGES.map(([value, label]) => ({ value, label }));
}

function languageName(code) {
    return languageOptions().find(language => language.value === code)?.label ?? code;
}

/** The language the chat is shown in right now, or null for the original. */
function chatLanguage() {
    const chat = ctx().chat ?? [];
    const translated = chat.find(message => message?.extra?.display_text);
    if (!translated) return null;
    return translated.extra.stmui_lang ?? translateSettings()?.target_language ?? null;
}

function setTargetLanguage(code) {
    const options = translateSettings();
    if (options) {
        options.target_language = code;
        const select = document.getElementById('translation_target_language');
        if (select) select.value = code;
        ctx().saveSettingsDebounced?.();
    }
    settings.recentLanguages = [code, ...(settings.recentLanguages ?? []).filter(item => item !== code)].slice(0, 5);
    saveSettings();
}

function translateStatus(text, { done = false, failed = false } = {}) {
    let status = translation.status;
    if (!status) {
        status = h('div', { class: 'stmui-banner stmui-banner-info', role: 'status', 'aria-live': 'polite' }, [
            ui('languages', 'stmui-banner-icon'),
            h('span', { class: 'stmui-banner-text' }, [h('b'), h('small')]),
            h('button', {
                type: 'button',
                class: 'stmui-banner-btn',
                onclick: () => {
                    translation.cancel = true;
                },
            }, [t('Stop')]),
        ]);
        shieldFromDrawerAutoClose(status);
        document.body.append(status);
        translation.status = status;
    }
    const [title, note] = status.querySelectorAll('.stmui-banner-text > *');
    title.textContent = text;
    note.textContent = failed ? t('Some messages could not be translated. Check your internet connection.') : '';
    note.hidden = !failed;
    status.querySelector('.stmui-banner-btn').hidden = done;
    status.classList.toggle('stmui-banner-ok', done && !failed);
    if (done) {
        setTimeout(() => {
            if (translation.status !== status || translation.running) return;
            status.classList.add('stmui-banner-out');
            setTimeout(() => status.remove(), 250);
            translation.status = null;
        }, failed ? 5000 : 1800);
    }
}

// Google Translate straight from the browser: no detour through the SillyTavern
// server, and many messages in one request. A whole long chat is usually one or
// two requests, each well under a second.
const GOOGLE_URL = 'https://translate.googleapis.com/translate_a/t?client=gtx&sl=auto&format=html&tl=';
// The first batch is small so the messages on screen change almost at once.
const FIRST_BATCH_CHARS = 2500;
const BATCH_CHARS = 8000;
const BATCH_PARALLEL = 4;

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&nbsp;': ' ' };

/**
 * Markdown and line breaks become HTML tags that Google keeps in place, so the
 * translation keeps its bold, italics, paragraphs and code. Code is not translated.
 */
function toTranslatable(text) {
    const kept = [];
    const html = String(text)
        // Code blocks and inline code stay exactly as written.
        .replace(/```[\s\S]*?```|`[^`\n]+`/g, match => {
            kept.push(match);
            return `<code translate="no">${kept.length - 1}</code>`;
        })
        // A stray & or < that is not part of an entity or a tag.
        .replace(/&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;')
        .replace(/<(?![a-zA-Z/!])/g, '&lt;')
        .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
        .replace(/\*([^*\n]+)\*/g, '<i>$1</i>')
        .replace(/\n/g, '<br>');
    return { html, kept };
}

function fromTranslated(html, kept) {
    let text = String(html)
        .replace(/<code translate="no">\s*(\d+)\s*<\/code>/gi, (match, index) => kept[Number(index)] ?? match)
        // Google sometimes moves spaces inside the tags; move them back out.
        .replace(/<(b|i)>\s+/gi, ' <$1>')
        .replace(/\s+<\/(b|i)>/gi, '</$1> ')
        // …but no space between a closing tag and punctuation.
        .replace(/<\/(b|i)>\s+([.,!?;:)\]»”’。、！？])/gi, '</$1>$2')
        // A quote right after is a closing quote only when punctuation, a line break or the end follows.
        .replace(/<\/(b|i)>\s+(&quot;|&#39;|["'])(?=[.,!?;:]|\s*<br|\s*$)/gi, '</$1>$2')
        .replace(/<\/?b>/gi, '**')
        .replace(/<\/?i>/gi, '*')
        .replace(/[ \t]*<br\s*\/?>[ \t]?/gi, '\n')
        .replace(/&(amp|lt|gt|quot|#39|#x27|nbsp);/g, entity => ENTITIES[entity] ?? entity);
    // Tidy doubled spaces the moves above can leave, without touching line breaks.
    text = text.replace(/[ \t]{2,}/g, ' ').replace(/ +\n/g, '\n').replace(/\n +/g, '\n');
    return text.trim();
}

async function googleTranslateBatch(texts, code) {
    const body = new URLSearchParams();
    for (const text of texts) body.append('q', text);
    const response = await fetch(GOOGLE_URL + encodeURIComponent(code), { method: 'POST', body });
    if (!response.ok) throw new Error(`Google answered ${response.status}`);
    const data = await response.json();
    // One text may come back as ["…", "en"]; several as [["…", "en"], …].
    const list = texts.length === 1 && !Array.isArray(data[0]) ? [data] : data;
    return list.map(item => (Array.isArray(item) ? item[0] : item));
}

function messageSource(message) {
    const context = ctx();
    return context.substituteParams ? context.substituteParams(message.mes, { name2Override: message.name }) : message.mes;
}

function applyTranslation(id, message, code, text) {
    if (typeof message.extra !== 'object' || !message.extra) message.extra = {};
    message.extra.display_text = text;
    message.extra.stmui_lang = code;
    ctx().updateMessageBlock?.(Number(id), message);
}

/**
 * Translates the messages `ids` (newest first) into `code`.
 * Calls onProgress(done) as batches land and returns how many failed.
 */
async function translateMessages(ids, code, { onProgress = () => {}, isCancelled = () => false } = {}) {
    const provider = translateSettings()?.provider ?? 'google';
    let done = 0;
    let failed = 0;
    // Providers other than Google, or Google when the direct route fails: SillyTavern's own route.
    const slowRoute = async list => {
        const module = await translatorModule();
        if (!module) {
            failed += list.length;
            done += list.length;
            onProgress(done);
            return;
        }
        let next = 0;
        const worker = async () => {
            while (next < list.length && !isCancelled()) {
                const id = list[next++];
                const message = ctx().chat?.[id];
                if (!message) continue;
                try {
                    applyTranslation(id, message, code, await module.translate(messageSource(message), code));
                } catch {
                    failed++;
                }
                done++;
                onProgress(done);
            }
        };
        await Promise.all(Array.from({ length: TRANSLATE_WORKERS }, worker));
    };
    if (provider !== 'google') {
        await slowRoute(ids);
        return failed;
    }
    // Pack messages into batches of about BATCH_CHARS, newest first.
    const batches = [];
    let current = [];
    let size = 0;
    for (const id of ids) {
        const message = ctx().chat?.[id];
        if (!message) continue;
        const prepared = toTranslatable(messageSource(message));
        const limit = batches.length ? BATCH_CHARS : FIRST_BATCH_CHARS;
        if (current.length && size + prepared.html.length > limit) {
            batches.push(current);
            current = [];
            size = 0;
        }
        current.push({ id, prepared });
        size += prepared.html.length;
    }
    if (current.length) batches.push(current);
    let next = 0;
    const worker = async () => {
        while (next < batches.length && !isCancelled()) {
            const batch = batches[next++];
            try {
                const out = await googleTranslateBatch(batch.map(item => item.prepared.html), code);
                batch.forEach((item, index) => {
                    const message = ctx().chat?.[item.id];
                    if (message && typeof out[index] === 'string') applyTranslation(item.id, message, code, fromTranslated(out[index], item.prepared.kept));
                    else failed++;
                });
                done += batch.length;
                onProgress(done);
            } catch (error) {
                console.debug(LOG, 'Direct Google Translate failed; using SillyTavern instead', error);
                await slowRoute(batch.map(item => item.id));
            }
        }
    };
    await Promise.all(Array.from({ length: BATCH_PARALLEL }, worker));
    return failed;
}

async function translateChat(code) {
    if (translation.running) return;
    const provider = translateSettings()?.provider ?? 'google';
    if (provider !== 'google' && !(await translatorModule())) {
        globalThis.toastr?.error(t('Turn on "Chat Translation" in Extensions → Manage extensions.'), t('Translation is off'));
        return;
    }
    setTargetLanguage(code);
    const context = ctx();
    const chat = context.chat ?? [];
    const chatId = context.getCurrentChatId?.();
    const todo = [];
    // Newest first: the messages on screen change right away.
    for (let id = chat.length - 1; id >= 0; id--) {
        const message = chat[id];
        if (!message || message.is_system || !String(message.mes ?? '').trim()) continue;
        if (message.extra?.display_text && message.extra?.stmui_lang === code) continue;
        todo.push(id);
    }
    const name = languageName(code);
    if (!todo.length) {
        translateStatus(t('Already in {lang}', { lang: name }), { done: true });
        return;
    }
    translation.running = true;
    translation.cancel = false;
    const total = todo.length;
    translateStatus(t('Translating to {lang}… {done}/{total}', { lang: name, done: 0, total }));
    const failed = await translateMessages(todo, code, {
        isCancelled: () => translation.cancel || ctx().getCurrentChatId?.() !== chatId,
        onProgress: done => {
            if (!translation.cancel) translateStatus(t('Translating to {lang}… {done}/{total}', { lang: name, done, total }));
        },
    });
    translation.running = false;
    if (ctx().getCurrentChatId?.() === chatId) await ctx().saveChat?.();
    shell?.update();
    // Every message changed its text, so its height too.
    primeChatSizes();
    if (translation.cancel) translateStatus(t('Translation stopped'), { done: true });
    else translateStatus(failed === total ? t('Could not reach the translator') : t('Chat shown in {lang}', { lang: name }), { done: true, failed: failed > 0 });
}

/** New, edited and swiped messages follow the chat's language while "Translate new messages too" is on. */
const autoQueue = new Set();
let autoTimer = 0;

function queueAutoTranslate(id) {
    if (!active || !settings.autoTranslate) return;
    const code = chatLanguage();
    if (!code) return;
    autoQueue.add(Number(id));
    window.clearTimeout(autoTimer);
    autoTimer = window.setTimeout(async () => {
        const ids = [...autoQueue].filter(item => {
            const message = ctx().chat?.[item];
            return message && !message.is_system && String(message.mes ?? '').trim();
        }).sort((a, b) => b - a);
        autoQueue.clear();
        if (!ids.length) return;
        await translateMessages(ids, code);
        await ctx().saveChat?.();
    }, 150);
}

/** An edited or swiped message must not keep showing its old translation. */
function dropTranslation(id) {
    const message = ctx().chat?.[Number(id)];
    if (!message?.extra?.stmui_lang) return;
    delete message.extra.display_text;
    delete message.extra.stmui_lang;
}

async function showOriginal() {
    translation.cancel = true;
    const context = ctx();
    let changed = false;
    (context.chat ?? []).forEach((message, id) => {
        if (!message?.extra?.display_text && !message?.extra?.reasoning_display_text) return;
        delete message.extra.display_text;
        delete message.extra.reasoning_display_text;
        delete message.extra.stmui_lang;
        context.updateMessageBlock?.(id, message);
        changed = true;
    });
    if (changed) await context.saveChat?.();
    shell?.update();
    if (changed) primeChatSizes();
    translateStatus(t('Showing the original text'), { done: true });
}

function setAutoTranslate(on) {
    settings.autoTranslate = on;
    saveSettings();
    // Pocket Tavern translates new messages itself (faster); keep SillyTavern's own auto mode off so it is not done twice.
    const options = translateSettings();
    if (options && options.auto_mode !== 'none') {
        options.auto_mode = 'none';
        const select = document.getElementById('translation_auto_mode');
        if (select) select.value = 'none';
        ctx().saveSettingsDebounced?.();
    }
}

/** The language one tap translates to: the last one picked in the sheet. */
function quickLanguage() {
    return settings.recentLanguages?.[0] ?? null;
}

/** One tap: translate the chat, show the original again, or stop a running translation. */
function quickTranslate() {
    const inChat = !!(ctx().groupId || ctx().characterId !== undefined);
    if (!inChat) {
        globalThis.toastr?.info(t('Open a chat first.'));
        return;
    }
    if (translation.running) {
        translation.cancel = true;
        return;
    }
    if (chatLanguage()) {
        showOriginal();
        return;
    }
    const code = quickLanguage();
    if (code) translateChat(code);
    else openTranslateSheet();
}

/**
 * SillyTavern's own "Translate Chat" in the ✨ menu translates one message at a
 * time. While Pocket Tavern is on, that item does the same one-tap translate as the
 * button in the top bar.
 */
function onWandTranslateClick(event) {
    if (!active || !(event.target instanceof Element) || !event.target.closest('#translate_chat')) return;
    event.preventDefault();
    event.stopPropagation();
    // Stopping the click also stops SillyTavern from closing the menu; close it the same way it would.
    const menu = document.getElementById('extensionsMenu');
    if (menu && getComputedStyle(menu).display !== 'none') document.getElementById('extensionsMenuButton')?.click();
    quickTranslate();
}

function openTranslateSheet() {
    const current = chatLanguage();
    const inChat = !!(ctx().groupId || ctx().characterId !== undefined);
    showSheet(new MenuSheet({
        title: t('Translate chat'),
        subtitle: current ? t('Showing {lang}. The original text is kept.', { lang: languageName(current) }) : t('Pick a language. The original text is kept.'),
        fill: body => {
            if (!inChat) {
                body.append(h('p', { class: 'stmui-menu-foot', text: t('Open a chat first.') }));
                return;
            }
            const top = [];
            if (current) {
                top.push(h('button', {
                    type: 'button',
                    class: 'stmui-menu-row',
                    onclick: () => {
                        closeSheet(true);
                        showOriginal();
                    },
                }, [ui('reset', 'stmui-menu-row-icon'), h('span', { text: t('Show original') })]));
            }
            const auto = h('input', { type: 'checkbox', class: 'stmui-switch', role: 'switch' });
            auto.checked = !!settings.autoTranslate;
            auto.addEventListener('change', () => setAutoTranslate(auto.checked));
            top.push(h('label', { class: 'stmui-switch-row' }, [
                h('span', { class: 'stmui-switch-text' }, [h('span', { text: t('Translate new replies too') }), h('small', { text: t('Each new reply is shown in the chosen language.') })]),
                auto,
            ]));
            body.append(h('div', { class: 'stmui-menu-list' }, top));

            const all = languageOptions();
            const recent = (settings.recentLanguages ?? []).map(code => all.find(language => language.value === code)).filter(Boolean);
            const languageRow = language => h('button', {
                type: 'button',
                class: `stmui-menu-row stmui-choice ${language.value === current ? 'stmui-choice-on' : ''}`,
                'data-search': normalizeText(`${language.label} ${language.value}`),
                onclick: () => {
                    closeSheet(true);
                    buzz(8);
                    translateChat(language.value);
                },
            }, [h('span', { text: language.label }), language.value === current ? ui('check', 'stmui-menu-row-icon') : null]);
            const search = h('input', { type: 'search', class: 'text_pole stmui-choice-search', placeholder: t('Search languages'), 'aria-label': t('Search languages') });
            const recentBlock = recent.length ? [h('p', { class: 'stmui-menu-heading', text: t('Recent') }), h('div', { class: 'stmui-menu-list' }, recent.map(languageRow))] : [];
            const allRows = all.map(languageRow);
            const allHeading = h('p', { class: 'stmui-menu-heading', text: t('All languages') });
            search.addEventListener('input', () => {
                const words = normalizeText(search.value).split(/\s+/).filter(Boolean);
                for (const row of allRows) row.hidden = !words.every(word => row.dataset.search.includes(word));
                for (const element of recentBlock) element.hidden = words.length > 0;
            });
            body.append(h('p', { class: 'stmui-menu-heading', text: t('Languages') }), search, ...recentBlock, allHeading, h('div', { class: 'stmui-menu-list' }, allRows));
            const provider = translateSettings()?.provider ?? 'google';
            const providerName = { google: 'Google Translate', deepl: 'DeepL', bing: 'Bing', yandex: 'Yandex', libre: 'LibreTranslate', lingva: 'Lingva', deeplx: 'DeepLX', oneringtranslator: 'OneRingTranslator' }[provider] ?? provider;
            body.append(h('p', { class: 'stmui-menu-foot', text: t('Tip: tap the translate button to switch between your language and the original. Hold it to open this list.') }));
            body.append(h('p', { class: 'stmui-menu-foot', text: t('Uses {provider} through your SillyTavern server. You can change it in Extensions → Chat Translation.', { provider: providerName }) }));
        },
    }));
}

// -- characters page: labeled card tools, tabs, favorites captions, A–Z strip

const CARD_TOOLS = [
    ['#favorite_button', 'Favorite'],
    ['#advanced_div', 'Advanced'],
    ['#world_button', 'Lore'],
    ['.chat_lorebook_button', 'Chat lore'],
    ['#char_connections_button', 'Personas'],
    ['#export_button', 'Export'],
    ['#dupe_button', 'Duplicate'],
    ['#delete_button', 'Delete'],
    ['#create_button_label', 'Create'],
];
const CARD_TABS = [['desc', 'Description'], ['greet', 'First message'], ['notes', 'Notes & tags']];
const chars = { observer: null, listObserver: null, azTimer: 0, tab: 'desc' };

function displayName(title) {
    return String(title ?? '').split('\n')[0].replace(/^\[[^\]]+\]\s*/, '').trim();
}

function syncCharacterPage() {
    const form = document.getElementById('form_create');
    const want = active && settings.touchSizing && settings.charPage;
    document.documentElement.classList.toggle('stmui-charpage', !!want);
    if (!want) {
        restoreCharToolbar();
        document.getElementById('rm_characters_block')?.classList.remove('stmui-one-page');
        document.querySelectorAll('.stmui-btn-label, #stmui_card_tabs, .stmui-hero-name, .stmui-cap, #stmui_az, #stmui_az_bubble').forEach(node => node.remove());
        form?.classList.remove('stmui-ctab-desc', 'stmui-ctab-greet', 'stmui-ctab-notes');
        chars.observer?.disconnect();
        chars.listObserver?.disconnect();
        chars.observer = null;
        chars.listObserver = null;
        return;
    }
    buildCharToolbar();
    updateCharPaging();
    if (!form) return;

    // Each card tool gets a short label under its icon.
    for (const [selector, label] of CARD_TOOLS) {
        const button = form.querySelector(selector);
        if (button && !button.querySelector('.stmui-btn-label')) button.append(h('span', { class: 'stmui-btn-label', text: label }));
    }


    // The name, big, under the avatar.
    const avatarLabel = document.getElementById('avatar_div_div');
    let heroName = form.querySelector('.stmui-hero-name');
    if (avatarLabel && !heroName) {
        heroName = h('div', { class: 'stmui-hero-name' });
        avatarLabel.after(heroName);
    }
    if (heroName) {
        const creating = isShown(document.getElementById('name_div'));
        heroName.hidden = creating;
        heroName.textContent = document.getElementById('character_name_pole')?.value?.trim() || '';
    }

    // Description, first message and notes on tabs instead of one long scroll.
    if (!document.getElementById('stmui_card_tabs')) {
        const bar = h('div', { id: 'stmui_card_tabs', class: 'stmui-segmented stmui-card-tabs', role: 'tablist' },
            CARD_TABS.map(([key, label]) => h('button', {
                type: 'button',
                class: 'stmui-seg',
                'data-tab': key,
                onclick: () => setCardTab(key),
            }, [label])));
        const anchor = document.getElementById('spoiler_free_desc') ?? document.getElementById('descriptionWrapper');
        anchor?.before(bar);
    }
    setCardTab(chars.tab, false);

    // Favorites strip: names under the round avatars.
    captionFavorites();
    if (!chars.observer) {
        chars.observer = new MutationObserver(() => captionFavorites());
        const wrapper = document.getElementById('HotSwapWrapper');
        if (wrapper) chars.observer.observe(wrapper, { childList: true, subtree: true });
    }
    // The list re-renders on search, sort and paging: rebuild the A–Z strip each time.
    if (!chars.listObserver) {
        const list = document.getElementById('rm_print_characters_block');
        if (list) {
            chars.listObserver = new MutationObserver(() => {
                window.clearTimeout(chars.azTimer);
                chars.azTimer = window.setTimeout(() => {
                    buildAzStrip();
                    updateCharPaging();
                    updateCharToolbar();
                }, 150);
            });
            chars.listObserver.observe(list, { childList: true });
            document.getElementById('character_sort_order')?.addEventListener('change', () => setTimeout(buildAzStrip, 300));
        }
    }
    buildAzStrip();
}

/**
 * One tidy row above the character list: search, sort, grid/list and a ＋ menu
 * with everything SillyTavern spreads over several rows of small buttons.
 * SillyTavern's own buttons stay in the page (hidden) and do the actual work.
 */
function buildCharToolbar() {
    const top = document.getElementById('charListFixedTop');
    const search = document.getElementById('character_search_bar');
    if (!top || !search) return;
    let bar = document.getElementById('stmui_char_toolbar');
    if (!bar) {
        const button = (iconName, label, onclick, extra = '') => h('button', {
            type: 'button', class: `stmui-ctool ${extra}`, 'aria-label': label, title: label, onclick,
        }, [ui(iconName)]);
        bar = h('div', { id: 'stmui_char_toolbar', class: 'stmui-char-toolbar' }, [
            h('div', { class: 'stmui-ctool-search' }),
            button('sort', 'Sort', () => openSortSheet(), 'stmui-ctool-sort'),
            button('grid', 'Grid or list', () => {
                buzz(6);
                document.getElementById('charListGridToggle')?.click();
                setTimeout(updateCharToolbar, 50);
            }, 'stmui-ctool-view'),
            button('plus', 'Add and more', () => openCharActions(), 'stmui-ctool-add'),
        ]);
        shieldFromDrawerAutoClose(bar);
        top.prepend(bar);
    }
    // SillyTavern's search box moves into the row (it goes back when Pocket Tavern is turned off).
    const slot = bar.querySelector('.stmui-ctool-search');
    if (search.parentElement !== slot) slot.append(search);
    updateCharToolbar();
}

function updateCharToolbar() {
    const bar = document.getElementById('stmui_char_toolbar');
    if (!bar) return;
    const grid = document.body.classList.contains('charListGrid');
    const view = bar.querySelector('.stmui-ctool-view');
    const icon = grid ? 'list' : 'grid';
    if (view && view.dataset.icon !== icon) {
        view.dataset.icon = icon;
        view.replaceChildren(ui(icon));
        view.setAttribute('aria-label', t(grid ? 'Show as list' : 'Show as grid'));
    }
    const sort = document.getElementById('character_sort_order');
    const sortButton = bar.querySelector('.stmui-ctool-sort');
    if (sort && sortButton) sortButton.title = `${t('Sort')}: ${sort.selectedOptions[0]?.textContent.trim() ?? ''}`;
}

function restoreCharToolbar() {
    const search = document.getElementById('character_search_bar');
    const form = document.getElementById('form_character_search_form');
    if (search && form && search.parentElement !== form) form.append(search);
    document.getElementById('stmui_char_toolbar')?.remove();
}

function openSortSheet() {
    const select = document.getElementById('character_sort_order');
    if (!select) return;
    openChoiceSheet({
        title: t('Sort characters'),
        options: Array.from(select.options).filter(option => !option.hidden && option.value !== 'Search').map(option => ({ value: option.value, label: option.textContent.trim() })),
        current: select.value,
        onPick: value => {
            pickFromSelect(select, value);
            setTimeout(() => {
                updateCharToolbar();
                buildAzStrip();
            }, 300);
        },
    });
}

/** Every button from SillyTavern's toolbar (and extensions that add one), with its name. */
function openCharActions() {
    const buttons = Array.from(document.querySelectorAll('#rm_button_bar > .menu_button, #rm_buttons_container > .menu_button'))
        .filter(button => button.style.display !== 'none' && !button.classList.contains('displayNone'));
    const nameOf = button => {
        const known = {
            rm_button_create: 'New character',
            character_import_button: 'Import from a file',
            external_import_button: 'Import from a link',
            rm_button_group_chats: 'New group chat',
        }[button.id];
        return known ? t(known) : (button.getAttribute('title') || '').split('\n')[0].trim() || t('Action');
    };
    showSheet(new MenuSheet({
        title: t('Characters'),
        subtitle: t('Add characters, groups and more'),
        fill: body => {
            const rows = buttons.map(button => {
                const faClass = Array.from(button.classList).find(name => name.startsWith('fa-') && !['fa-solid', 'fa-regular', 'fa-fw'].includes(name));
                return h('button', {
                    type: 'button',
                    class: 'stmui-menu-row',
                    onclick: () => {
                        closeSheet(true);
                        button.click();
                    },
                }, [faClass ? ui(faClass, 'stmui-menu-row-icon') : ui('plus', 'stmui-menu-row-icon'), h('span', { text: nameOf(button) })]);
            });
            const bulk = document.getElementById('bulkEditButton');
            if (bulk) {
                rows.push(h('button', {
                    type: 'button',
                    class: 'stmui-menu-row',
                    onclick: () => {
                        closeSheet(true);
                        bulk.click();
                    },
                }, [ui('check', 'stmui-menu-row-icon'), h('span', { text: t('Select several') })]));
            }
            body.append(h('div', { class: 'stmui-menu-list' }, rows));
        },
    }));
}

/** Paging controls only matter when there is more than one page. */
function updateCharPaging() {
    const holder = document.getElementById('rm_characters_block');
    if (!holder) return;
    const box = document.getElementById('rm_print_characters_pagination');
    // SillyTavern shows no page numbers here, only ‹ › and "1-25 .. 40", so look at those.
    const can = selector => {
        const item = box?.querySelector(selector);
        return !!item && !item.classList.contains('disabled');
    };
    const numbers = (box?.querySelector('.paginationjs-nav')?.textContent ?? '').match(/\d+/g)?.map(Number) ?? [];
    const many = box?.querySelectorAll('li.paginationjs-page').length > 1
        || can('.paginationjs-prev') || can('.paginationjs-next')
        || (numbers.length >= 3 && numbers[1] < numbers[2]);
    holder.classList.toggle('stmui-one-page', !many);
}

function setCardTab(key, scroll = true) {
    chars.tab = key;
    const form = document.getElementById('form_create');
    if (!form) return;
    for (const [name] of CARD_TABS) form.classList.toggle(`stmui-ctab-${name}`, name === key);
    for (const button of document.querySelectorAll('#stmui_card_tabs .stmui-seg')) {
        const on = button.dataset.tab === key;
        button.classList.toggle('stmui-seg-on', on);
        button.setAttribute('aria-selected', String(on));
    }
    if (scroll) document.getElementById('stmui_card_tabs')?.scrollIntoView({ block: 'nearest' });
}

function captionFavorites() {
    for (const avatar of document.querySelectorAll('#HotSwapWrapper .hotswap .avatar')) {
        if (avatar.querySelector('.stmui-cap')) continue;
        const name = displayName(avatar.getAttribute('title'));
        if (name) avatar.append(h('span', { class: 'stmui-cap', text: name }));
    }
}

function letterOf(name) {
    const first = normalizeText(String(name ?? '').trim()).charAt(0).toUpperCase();
    return /[A-Z]/.test(first) ? first : '#';
}

/** A strip of letters on the right of the list; tap or slide to jump. Only for A–Z / Z–A order. */
function buildAzStrip() {
    const holder = document.getElementById('rm_characters_block');
    const list = document.getElementById('rm_print_characters_block');
    const old = document.getElementById('stmui_az');
    const none = () => old?.remove();
    if (!active || !settings.touchSizing || !settings.charPage || !holder || !list) return none();
    const sort = document.getElementById('character_sort_order')?.selectedOptions[0];
    if (sort?.dataset.field !== 'name' || sort?.dataset.order === 'random') return none();
    const entries = Array.from(list.querySelectorAll(':scope > .character_select, :scope > .group_select, :scope > .bogus_folder_select'));
    if (entries.length < 10) return none();
    const firstOf = new Map();
    for (const entry of entries) {
        const letter = letterOf(entry.querySelector('.ch_name')?.textContent);
        if (!firstOf.has(letter)) firstOf.set(letter, entry);
    }
    if (firstOf.size < 3) return none();
    const letters = Array.from(firstOf.keys());
    // Same letters as before (the list was only redrawn): keep the strip, just point it at the new entries.
    if (old && old.parentElement === holder && old.dataset.letters === letters.join('')) {
        old.stmuiFirst = firstOf;
        placeAzStrip(old, list, letters.length);
        return;
    }
    old?.remove();
    const strip = h('div', { id: 'stmui_az', class: 'stmui-az', 'aria-label': 'Jump to letter', 'data-letters': letters.join('') }, letters.map(letter => h('span', { text: letter, 'data-letter': letter })));
    strip.stmuiFirst = firstOf;
    let bubble = document.getElementById('stmui_az_bubble');
    if (!bubble) {
        bubble = h('div', { id: 'stmui_az_bubble', class: 'stmui-az-bubble', 'aria-hidden': 'true' });
        holder.append(bubble);
    }
    let last = '';
    const jump = event => {
        const rect = strip.getBoundingClientRect();
        const index = Math.max(0, Math.min(letters.length - 1, Math.floor(((event.clientY - rect.top) / rect.height) * letters.length)));
        const letter = letters[index];
        if (letter === last) return;
        last = letter;
        const target = strip.stmuiFirst.get(letter);
        if (target?.isConnected) list.scrollTop += target.getBoundingClientRect().top - list.getBoundingClientRect().top - 2;
        bubble.textContent = letter;
        bubble.classList.add('stmui-az-bubble-on');
        buzz(4);
    };
    strip.addEventListener('pointerdown', event => {
        event.preventDefault();
        try {
            strip.setPointerCapture?.(event.pointerId);
        } catch {
            // The pointer is already gone.
        }
        last = '';
        jump(event);
    });
    strip.addEventListener('pointermove', event => {
        if (event.buttons || event.pointerType === 'touch') jump(event);
    });
    const end = () => {
        last = '';
        bubble.classList.remove('stmui-az-bubble-on');
    };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) strip.addEventListener(type, end);
    shieldFromDrawerAutoClose(strip);
    holder.append(strip);
    placeAzStrip(strip, list, letters.length);
}

/** Sits exactly beside the list, below the controls. Only writes when the place changed. */
function placeAzStrip(strip, list, count) {
    const top = `${list.offsetTop + 6}px`;
    const height = `${Math.max(120, Math.min(list.clientHeight - 12, count * 26))}px`;
    if (strip.style.top !== top) strip.style.top = top;
    if (strip.style.height !== height) strip.style.height = height;
}

// -- recent chats: search, pinned section, swipe to pin or delete

const welcome = { observer: null };

function syncWelcome() {
    const chat = document.getElementById('chat');
    const want = active && settings.chatStyle && settings.recentTools;
    if (!want) {
        welcome.observer?.disconnect();
        welcome.observer = null;
        for (const group of document.querySelectorAll('.stmui-chat-group')) {
            group.querySelectorAll('.recentChat').forEach(card => group.before(card));
            group.remove();
        }
        document.querySelectorAll('.showMoreChats.stmui-native-hidden').forEach(node => node.classList.remove('stmui-native-hidden'));
        document.querySelectorAll('.stmui-recent-search, .stmui-recent-heading, .stmui-recent-empty, .stmui-swipe-hint').forEach(node => node.remove());
        document.querySelectorAll('.recentChat.stmui-match, .recentChat.stmui-nomatch').forEach(node => node.classList.remove('stmui-match', 'stmui-nomatch'));
        document.querySelectorAll('.welcomePanel[data-stmui]').forEach(node => delete node.dataset.stmui);
        return;
    }
    if (chat && !welcome.observer) {
        welcome.observer = new MutationObserver(() => enhanceWelcome());
        welcome.observer.observe(chat, { childList: true, subtree: false });
    }
    enhanceWelcome();
}

function enhanceWelcome() {
    const panel = document.querySelector('#chat .welcomePanel');
    if (!panel || panel.dataset.stmui === '1') return;
    const list = panel.querySelector('.recentChatList');
    if (!list) return;
    panel.dataset.stmui = '1';
    const cards = Array.from(list.querySelectorAll('.recentChat'));

    // Pinned chats first under their own heading, as they are.
    const pinned = cards.filter(card => card.querySelector('.recentChatPinned'));
    const rest = cards.filter(card => !pinned.includes(card));
    if (pinned.length) pinned[0].before(h('p', { class: 'stmui-recent-heading', text: 'Pinned' }));

    // The rest grouped by character (or group chat): one card each, newest first.
    const groups = new Map();
    for (const card of rest) {
        const key = card.dataset.group ? `g:${card.dataset.group}` : `c:${card.dataset.avatar}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(card);
    }
    if (groups.size) {
        onChatScroll();
        // A placeholder marks the spot: the rows themselves move into the groups.
        const spot = document.createComment('stmui-groups');
        rest[0].before(spot);
        if (pinned.length) spot.before(h('p', { class: 'stmui-recent-heading', text: 'Recent' }));
        for (const chats of groups.values()) spot.before(buildChatGroup(chats));
        spot.remove();
    }
    // SillyTavern's own "show more" folds chats away; the groups show them all.
    list.querySelector('.showMoreChats')?.classList.add('stmui-native-hidden');

    if (cards.length > 3) {
        const empty = h('p', { class: 'stmui-recent-empty', text: 'No chat matches that.', hidden: true });
        const search = h('input', { type: 'search', class: 'text_pole stmui-recent-search', placeholder: 'Search recent chats', 'aria-label': 'Search recent chats', enterkeyhint: 'search' });
        search.addEventListener('input', () => {
            const words = normalizeText(search.value).split(/\s+/).filter(Boolean);
            let shown = 0;
            for (const card of cards) {
                // A chat matches by its own text or its character's name.
                const group = card.closest('.stmui-chat-group');
                const text = normalizeText(`${card.textContent} ${group?.dataset.name ?? ''}`);
                const match = !words.length || words.every(word => text.includes(word));
                card.classList.toggle('stmui-match', words.length > 0 && match);
                card.classList.toggle('stmui-nomatch', !match);
                if (match) shown++;
            }
            for (const group of list.querySelectorAll('.stmui-chat-group')) {
                group.hidden = words.length > 0 && !group.querySelector('.recentChat:not(.stmui-nomatch)');
                group.classList.toggle('stmui-group-found', words.length > 0 && !group.hidden);
            }
            list.classList.toggle('stmui-searching', words.length > 0);
            empty.hidden = shown > 0;
        });
        list.before(search);
        list.append(empty);
    }

    for (const card of cards) wireSwipe(card, card.parentElement);
    showWelcomeFromTop();
}

/**
 * SillyTavern scrolls the chat to its end after drawing the start screen (and
 * again after its welcome message), which put you at the bottom of Recent
 * chats. Start at the top instead, unless you already started scrolling.
 */
function showWelcomeFromTop() {
    const chat = document.getElementById('chat');
    if (!chat) return;
    let touched = false;
    const stop = () => { touched = true; };
    chat.addEventListener('touchstart', stop, { once: true, passive: true });
    chat.addEventListener('wheel', stop, { once: true, passive: true });
    for (const delay of [0, 120, 400, 900]) {
        setTimeout(() => {
            if (!touched && chat.querySelector('.welcomePanel')) chat.scrollTop = 0;
        }, delay);
    }
}

/** The cards after this one that are on screen (or just below), for the glide. */
function followingCards(group) {
    const out = [];
    const limit = window.innerHeight + 200;
    for (let node = group.nextElementSibling; node && out.length < 12; node = node.nextElementSibling) {
        if (node.getBoundingClientRect().top > limit) break;
        out.push(node);
    }
    return out;
}

/** Characters whose chat list is open; remembered while the app stays open. */
const openChatGroups = new Set();

/** Opens this chat, then runs `then` once SillyTavern has switched to it. */
function openRecentThen(card, then) {
    const context = ctx();
    const before = context.getCurrentChatId?.();
    const done = () => setTimeout(then, 150);
    if (before && before === card.dataset.file) {
        done();
        return;
    }
    let fired = false;
    const once = () => {
        if (fired) return;
        fired = true;
        context.eventSource?.removeListener?.(context.eventTypes.CHAT_CHANGED, once);
        done();
    };
    context.eventSource?.on?.(context.eventTypes.CHAT_CHANGED, once);
    card.click();
    // In case the event never comes (for example the chat was already open).
    setTimeout(once, 2500);
}

/**
 * One character's recent chats as a dropdown card. The top row shows the
 * character, the last thing said and when; tap it for the latest chat, or the
 * arrow to open the list: quick actions (new chat, all chats, character card)
 * and every recent chat with them. SillyTavern's own chat rows are moved in, so
 * tapping, renaming, pinning and deleting work as before.
 */
function buildChatGroup(chats) {
    const latest = chats[0];
    const isGroupChat = latest.classList.contains('group');
    const key = isGroupChat ? `g:${latest.dataset.group}` : `c:${latest.dataset.avatar}`;
    const name = latest.querySelector('.characterName')?.textContent.trim() ?? '';
    const group = h('section', { class: 'stmui-chat-group', 'data-name': name });
    if (isGroupChat) group.classList.add('stmui-chat-group-group');

    // The top row: open the latest chat.
    const main = h('button', {
        type: 'button',
        class: 'stmui-group-main',
        onclick: () => {
            buzz(6);
            latest.click();
        },
    });
    main.setAttribute('aria-label', t('Open the latest chat with {name}', { name }));
    const picture = latest.querySelector(':scope > .avatar')?.cloneNode(true);
    const face = h('span', { class: 'stmui-group-face' });
    if (picture) {
        picture.classList.add('stmui-group-avatar');
        picture.removeAttribute('title');
        face.append(picture);
    }
    if (chats.length > 1) face.append(h('span', { class: 'stmui-group-badge', text: String(chats.length) }));
    const title = h('b', { class: 'stmui-group-name' });
    title.textContent = name;
    const when = h('small', { class: 'stmui-group-when' });
    when.textContent = latest.querySelector('.chatDate')?.textContent.trim() ?? '';
    const last = h('small', { class: 'stmui-group-last' });
    last.textContent = latest.querySelector('.chatMessage')?.textContent.replace(/\s+/g, ' ').trim() ?? '';
    main.append(face, h('span', { class: 'stmui-group-text' }, [h('span', { class: 'stmui-group-line' }, [title, when]), last]));

    // The arrow: open or close the list.
    const toggle = h('button', {
        type: 'button',
        class: 'stmui-group-toggle',
        'aria-label': t('Show chats with {name}', { name }),
        onclick: () => {
            buzz(4);
            setOpen(!group.classList.contains('stmui-group-open'), true);
        },
    }, [ui('chevron-down')]);
    const setOpen = (open, animate = false) => {
        // The cards below move by however much this one grows or shrinks; they
        // glide there (movement only, so it stays smooth) instead of the card
        // growing frame by frame.
        const below = animate && motionAllowed() ? followingCards(group) : [];
        const before = below.map(card => card.getBoundingClientRect().top);
        group.classList.toggle('stmui-group-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        if (open) openChatGroups.add(key);
        else openChatGroups.delete(key);
        if (!below.length && !(animate && motionAllowed())) return;
        const quick = settings.motion === 'light';
        const timing = { duration: quick ? 160 : 280, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' };
        below.forEach((card, index) => {
            const shift = before[index] - card.getBoundingClientRect().top;
            if (Math.abs(shift) > 1) card.animate([{ transform: `translateY(${shift}px)` }, { transform: 'none' }], timing);
        });
        if (open) {
            panel.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], timing);
        }
    };

    // Inside: quick actions, then the chats.
    const action = (iconName, label, run) => h('button', {
        type: 'button',
        class: 'stmui-group-action',
        onclick: () => {
            buzz(6);
            openRecentThen(latest, run);
        },
    }, [ui(iconName), h('span', { text: label })]);
    const actions = h('div', { class: 'stmui-group-actions' }, [
        action('plus', 'New chat', () => document.getElementById('option_start_new_chat')?.click()),
        action('history', 'All chats', () => document.getElementById('option_select_chat')?.click()),
        isGroupChat ? null : action('user', 'Character', () => openPage('rightNavHolder')),
    ]);
    const list = h('div', { class: 'stmui-group-chats' }, chats);
    const panel = h('div', { class: 'stmui-group-panel' }, [h('div', { class: 'stmui-group-inner' }, [actions, list])]);
    group.append(h('div', { class: 'stmui-group-head' }, [main, toggle]), panel);
    setOpen(openChatGroups.has(key));
    return group;
}

/** Swipe a recent chat right to pin or unpin it, left to delete it (SillyTavern asks first). */
function wireSwipe(card, list) {
    if (card.dataset.stmuiSwipe) return;
    card.dataset.stmuiSwipe = '1';
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let tracking = false;
    let swiping = false;
    let hint = null;
    const reset = () => {
        card.style.transition = 'transform 0.22s var(--stmui-ease)';
        card.style.transform = '';
        hint?.remove();
        hint = null;
        setTimeout(() => {
            card.style.transition = '';
        }, 240);
    };
    card.addEventListener('touchstart', event => {
        if (!active || !settings.chatStyle || !settings.recentTools) return;
        if (event.touches.length !== 1 || event.target.closest('button')) return;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        dx = 0;
        tracking = true;
        swiping = false;
    }, { passive: true });
    card.addEventListener('touchmove', event => {
        if (!tracking) return;
        const x = event.touches[0].clientX - startX;
        const y = event.touches[0].clientY - startY;
        if (!swiping) {
            if (Math.abs(y) > 12 && Math.abs(y) > Math.abs(x)) {
                tracking = false;
                return;
            }
            if (Math.abs(x) < 14) return;
            swiping = true;
        }
        dx = Math.max(-140, Math.min(140, x));
        card.style.transition = 'none';
        card.style.transform = `translateX(${dx}px)`;
        const pinnedNow = !!card.querySelector('.pinChat.active, .recentChatPinned');
        const kind = dx > 0 ? 'pin' : 'delete';
        if (!hint || hint.dataset.kind !== kind) {
            hint?.remove();
            hint = h('div', { class: `stmui-swipe-hint stmui-swipe-${kind}`, 'data-kind': kind }, [
                ui(kind === 'pin' ? 'bookmark' : 'trash'),
                h('span', { text: kind === 'pin' ? (pinnedNow ? 'Unpin' : 'Pin') : 'Delete' }),
            ]);
            list.append(hint);
        }
        hint.style.top = `${card.offsetTop}px`;
        hint.style.height = `${card.offsetHeight}px`;
        hint.classList.toggle('stmui-swipe-ready', Math.abs(dx) > 90);
    }, { passive: true });
    const end = () => {
        if (!tracking) return;
        tracking = false;
        if (!swiping) return;
        const action = Math.abs(dx) > 90 ? (dx > 0 ? 'pin' : 'delete') : null;
        reset();
        if (action) {
            buzz(12);
            card.querySelector(action === 'pin' ? '.pinChat' : '.deleteChat')?.click();
        }
        // Then swallow the tap the browser sends after the swipe, so the chat does not open.
        const swallow = event => {
            event.preventDefault();
            event.stopImmediatePropagation();
        };
        card.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => card.removeEventListener('click', swallow, { capture: true }), 400);
    };
    card.addEventListener('touchend', end);
    card.addEventListener('touchcancel', end);
}

// -- chat history: grouped by date

const chatList = { observer: null, timer: 0 };

function chatDateOf(block) {
    const text = block.querySelector('.chat_messages_date')?.textContent?.trim();
    let time = text ? Date.parse(text) : NaN;
    if (Number.isNaN(time)) {
        const match = (block.getAttribute('file_name') ?? '').match(/(\d{4})-(\d{1,2})-(\d{1,2})\s*@?(\d{1,2})?h?\s*(\d{1,2})?m?/);
        if (match) time = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] ?? 0), Number(match[5] ?? 0)).getTime();
    }
    return Number.isNaN(time) ? null : new Date(time);
}

function dateGroup(date) {
    if (!date) return t('Older');
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const day = 86400000;
    if (date.getTime() >= startOfDay) return t('Today');
    if (date.getTime() >= startOfDay - day) return t('Yesterday');
    if (date.getTime() >= startOfDay - 6 * day) return t('This week');
    if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return t('This month');
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function groupChatHistory() {
    const list = document.getElementById('select_chat_div');
    if (!list) return;
    list.querySelectorAll('.stmui-date-heading').forEach(node => node.remove());
    if (!active || !settings.touchSizing || !settings.recentTools) return;
    let lastGroup = null;
    for (const wrapper of list.querySelectorAll(':scope > .select_chat_block_wrapper')) {
        if (getComputedStyle(wrapper).display === 'none') continue;
        const block = wrapper.querySelector('.select_chat_block');
        const group = dateGroup(block ? chatDateOf(block) : null);
        if (group !== lastGroup) {
            wrapper.before(h('p', { class: 'stmui-date-heading', text: group }));
            lastGroup = group;
        }
    }
}

function syncChatHistory() {
    const list = document.getElementById('select_chat_div');
    if (!active || !settings.touchSizing || !settings.recentTools) {
        chatList.observer?.disconnect();
        chatList.observer = null;
        list?.querySelectorAll('.stmui-date-heading').forEach(node => node.remove());
        return;
    }
    if (list && !chatList.observer) {
        chatList.observer = new MutationObserver(records => {
            // Ignore our own headings.
            if (records.every(record => [...record.addedNodes, ...record.removedNodes].every(node => node.classList?.contains('stmui-date-heading')))) return;
            window.clearTimeout(chatList.timer);
            chatList.timer = window.setTimeout(groupChatHistory, 80);
        });
        chatList.observer.observe(list, { childList: true, subtree: false, attributes: true, attributeFilter: ['style'], attributeOldValue: false });
        document.getElementById('select_chat_search')?.addEventListener('input', () => {
            window.clearTimeout(chatList.timer);
            chatList.timer = window.setTimeout(groupChatHistory, 350);
        });
    }
}

// -- search everything

async function recentChatList() {
    try {
        const response = await fetch('/api/chats/recent', {
            method: 'POST',
            headers: ctx().getRequestHeaders?.() ?? { 'Content-Type': 'application/json' },
            body: JSON.stringify({ max: 200 }),
            cache: 'no-cache',
        });
        return response.ok ? await response.json() : [];
    } catch {
        return [];
    }
}

async function lorebookNames() {
    try {
        const module = await import('/scripts/world-info.js');
        return Array.isArray(module.world_names) ? module.world_names : [];
    } catch {
        return Array.from(document.querySelectorAll('#world_editor_select option')).map(option => option.textContent.trim()).filter(Boolean);
    }
}

function allSettingItems() {
    const items = [];
    for (const pageId of SEARCH_PAGES) {
        const root = document.querySelector(`#${pageId} > .drawer-content`);
        if (!root) continue;
        const page = t(pageInfo(drawerById(pageId)).title);
        for (const item of settingItems(root)) items.push({ ...item, pageId, page });
    }
    return items;
}

async function openChatFile(chat) {
    const context = ctx();
    const file = String(chat.file_name ?? '').replace(/\.jsonl$/, '');
    closePages();
    if (chat.group) {
        await context.openGroupChat?.(chat.group, file);
        return;
    }
    const id = context.characters.findIndex(character => character.avatar === chat.avatar);
    if (id === -1) return;
    await context.selectCharacterById(id);
    if (context.getCurrentChatId?.() !== file) await ctx().openCharacterChat?.(file);
}

function openLorebook(name) {
    openPage('WI-SP-button');
    setTimeout(() => {
        const select = document.getElementById('world_editor_select');
        const option = Array.from(select?.options ?? []).find(item => item.textContent.trim() === name);
        if (select && option) {
            select.value = option.value;
            $j()(select).trigger('change');
        }
    }, 300);
}

function openGlobalSearch() {
    const context = ctx();
    const characters = (context.characters ?? []).map((character, id) => ({ kind: 'character', id, name: character.name, note: (character.description ?? '').replace(/\s+/g, ' ').slice(0, 80), avatar: character.avatar }));
    const groups = (context.groups ?? []).map(group => ({ kind: 'group', id: group.id, name: group.name, note: t('Group chat') }));
    let chats = null;
    let lorebooks = null;
    let settingsIndex = null;
    const load = Promise.all([
        recentChatList().then(list => {
            chats = list;
        }),
        lorebookNames().then(list => {
            lorebooks = list;
        }),
    ]);
    showSheet(new MenuSheet({
        title: t('Search everything'),
        subtitle: t('Characters, chats, lorebooks and settings'),
        fill: body => {
            const input = h('input', { type: 'search', class: 'text_pole stmui-choice-search', placeholder: t('Type to search…'), 'aria-label': t('Search everything'), enterkeyhint: 'search' });
            const results = h('div', { class: 'stmui-search-results' });
            const section = (title, rows) => (rows.length ? [h('p', { class: 'stmui-menu-heading', text: title }), h('div', { class: 'stmui-menu-list' }, rows)] : []);
            const row = (iconOrImage, label, note, onclick) => h('button', { type: 'button', class: 'stmui-menu-row', onclick }, [
                iconOrImage.startsWith('/') ? h('img', { class: 'stmui-choice-img', src: iconOrImage, alt: '', loading: 'lazy' }) : ui(iconOrImage, 'stmui-menu-row-icon'),
                h('span', { class: 'stmui-row-text' }, [h('span', { text: label }), note ? h('small', { text: note }) : null]),
            ]);
            const render = () => {
                const words = normalizeText(input.value).split(/\s+/).filter(Boolean);
                if (!words.length) {
                    results.replaceChildren(h('p', { class: 'stmui-menu-foot', text: t('Find a character, a chat by its name or last message, a lorebook or a setting.') }));
                    return;
                }
                const hit = text => words.every(word => normalizeText(text).includes(word));
                const go = action => () => {
                    closeSheet(true);
                    action();
                };
                const characterRows = [...characters, ...groups].filter(item => hit(`${item.name} ${item.note}`)).slice(0, 12).map(item => item.kind === 'character'
                    ? row(`/thumbnail?type=avatar&file=${encodeURIComponent(item.avatar)}`, item.name, item.note, go(async () => {
                        closePages();
                        await ctx().selectCharacterById(item.id);
                    }))
                    : row('users', item.name, item.note, go(async () => {
                        closePages();
                        await ctx().openGroupChat?.(item.id);
                    })));
                // Recent chats only carry the avatar file or group id; look the name up.
                const ownerName = chat => (chat.group
                    ? (context.groups ?? []).find(group => String(group.id) === String(chat.group))?.name
                    : characters.find(character => character.avatar === chat.avatar)?.name) ?? '';
                const chatRows = (chats ?? []).filter(chat => hit(`${ownerName(chat)} ${chat.file_name ?? ''} ${chat.mes ?? ''}`)).slice(0, 12).map(chat => row(
                    chat.avatar ? `/thumbnail?type=avatar&file=${encodeURIComponent(chat.avatar)}` : 'chats',
                    ownerName(chat) || String(chat.file_name ?? '').replace(/\.jsonl$/, ''),
                    `${String(chat.mes ?? '').replace(/\s+/g, ' ').slice(0, 80)}`,
                    go(() => openChatFile(chat)),
                ));
                const loreRows = (lorebooks ?? []).filter(name => hit(name)).slice(0, 8).map(name => row('book', name, t('Lorebook'), go(() => openLorebook(name))));
                if (!settingsIndex) settingsIndex = allSettingItems();
                const settingRows = settingsIndex.filter(item => hit(`${item.label} ${item.section} ${item.page}`)).slice(0, 12).map(item => row('settings', item.label, [item.page, item.section].filter(Boolean).join(' › '), go(() => {
                    openPage(item.pageId);
                    setTimeout(() => revealSetting(item.row), 350);
                })));
                const blocks = [
                    ...section(t('Characters'), characterRows),
                    ...section(t('Chats'), chatRows),
                    ...section(t('Lorebooks'), loreRows),
                    ...section(t('Settings'), settingRows),
                ];
                if (chats === null) blocks.push(h('p', { class: 'stmui-menu-foot', text: t('Loading chats…') }));
                results.replaceChildren(...(blocks.length ? blocks : [h('p', { class: 'stmui-menu-foot', text: t('Nothing matches that.') })]));
            };
            input.addEventListener('input', render);
            load.then(() => {
                if (input.isConnected) render();
            });
            body.append(input, results);
            render();
            setTimeout(() => input.focus(), 250);
        },
    }));
}

// -- sharp pictures and animated (GIF) character pictures

/**
 * SillyTavern shows 96×144 thumbnails everywhere; on a phone a grid card needs
 * about four times that. Pictures on screen are replaced by the original image,
 * scaled down in the browser to exactly the size the screen needs (so memory
 * stays low), and characters can have an animated GIF/WebP picture.
 */
const GIF_KEY = 'stmui_animated_avatar';
const pictures = {
    observer: null,
    seen: null,
    cache: new Map(),
    pending: new Map(),
    queue: [],
    running: 0,
    timer: 0,
    // Pictures the on-screen watcher reported as (nearly) on screen.
    near: new Set(),
    // New sources waiting to be put in, all in one frame.
    swaps: new Map(),
    swapFrame: 0,
    // The picture last shown in each kind of spot ("grid|avatar|Aria.png" → url).
    last: new Map(),
};

/** Which kind of spot a picture sits in; pictures in the same kind of spot have the same size. */
function pictureSpot(img) {
    if (img.closest('#rm_print_characters_block')) return document.body.classList.contains('charListGrid') ? 'grid' : 'list';
    if (img.closest('#HotSwapWrapper')) return 'fav';
    if (img.closest('#chat')) return 'chat';
    return null;
}

function rememberPicture(img, url) {
    const spot = pictureSpot(img);
    const info = img.dataset.stmuiThumb ? thumbInfo(img.dataset.stmuiThumb) : null;
    if (spot && info) pictures.last.set(`${spot}|${info.type}|${info.file}`, url);
}

/**
 * SillyTavern redraws its lists from scratch, with thumbnails. When this spot
 * already showed a sharp picture, put it straight back (this runs before the
 * page is drawn), so nothing flashes from blurry to sharp.
 */
function restoreKnownPicture(img) {
    const src = img.getAttribute('src') ?? '';
    const info = thumbInfo(src);
    const spot = info && pictureSpot(img);
    const url = spot && pictures.last.get(`${spot}|${info.type}|${info.file}`);
    if (!url) return false;
    img.dataset.stmuiThumb = src;
    img.setAttribute('src', url);
    return true;
}

/**
 * Puts in new picture sources together, so the page restyles once and a list
 * turns sharp in one go instead of picture by picture. Pictures made within
 * about 100 ms of each other go in on the same frame.
 */
function swapPicture(img, url) {
    pictures.swaps.set(img, url);
    if (pictures.swapFrame) return;
    pictures.swapFrame = -1;
    window.setTimeout(() => requestAnimationFrame(() => {
        pictures.swapFrame = 0;
        if (!pictures.swaps.size) return;
        const swaps = [...pictures.swaps];
        pictures.swaps.clear();
        for (const [image, src] of swaps) {
            if (image.isConnected && (image.getAttribute('src') === image.dataset.stmuiThumb || thumbInfo(image.getAttribute('src') ?? ''))) {
                image.setAttribute('src', src);
                rememberPicture(image, src);
            }
        }
    }), 100);
}

function thumbInfo(src) {
    try {
        const url = new URL(src, location.href);
        if (!url.pathname.endsWith('/thumbnail')) return null;
        const type = url.searchParams.get('type');
        const file = url.searchParams.get('file');
        if (!file || !['avatar', 'persona'].includes(type)) return null;
        return { type, file };
    } catch {
        return null;
    }
}

function animatedPictureFor(file) {
    const character = (ctx().characters ?? []).find(item => item.avatar === file);
    const url = character?.data?.extensions?.[GIF_KEY];
    return typeof url === 'string' && url ? url : null;
}

function fullPictureUrl({ type, file }) {
    return type === 'persona' ? `/User Avatars/${encodeURIComponent(file)}` : `/characters/${encodeURIComponent(file)}`;
}

/** The original picture scaled to `width` pixels, as an object URL (made once per size). */
function sharpPicture(info, width) {
    const key = `${info.type}|${info.file}|${width}`;
    if (pictures.cache.has(key)) return Promise.resolve(pictures.cache.get(key));
    if (pictures.pending.has(key)) return pictures.pending.get(key);
    const job = new Promise((resolve, reject) => {
        pictures.queue.push(async () => {
            try {
                const response = await fetch(fullPictureUrl(info));
                if (!response.ok) throw new Error(String(response.status));
                const blob = await response.blob();
                const bitmap = await createImageBitmap(blob);
                const scale = Math.min(1, width / bitmap.width);
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(bitmap.width * scale);
                canvas.height = Math.round(bitmap.height * scale);
                const context = canvas.getContext('2d');
                context.imageSmoothingQuality = 'high';
                context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                bitmap.close?.();
                const out = await new Promise(done => canvas.toBlob(done, 'image/webp', 0.92));
                const url = URL.createObjectURL(out ?? blob);
                pictures.cache.set(key, url);
                resolve(url);
            } catch (error) {
                reject(error);
            } finally {
                pictures.pending.delete(key);
            }
        });
        pumpPictures();
    });
    pictures.pending.set(key, job);
    return job;
}

function pumpPictures() {
    while (pictures.running < 3 && pictures.queue.length) {
        const task = pictures.queue.shift();
        pictures.running++;
        task().finally(() => {
            pictures.running--;
            pumpPictures();
        });
    }
}

/** Picks the best picture for one <img>. */
function upgradePicture(img) {
    if (!active) return;
    const current = img.getAttribute('src') ?? '';
    // SillyTavern sometimes sets the thumbnail again; remember what it asked for.
    const info = thumbInfo(current) ?? (img.dataset.stmuiThumb ? thumbInfo(img.dataset.stmuiThumb) : null);
    if (!info) return;
    if (thumbInfo(current)) img.dataset.stmuiThumb = current;
    const animated = info.type === 'avatar' && settings.animatedPictures ? animatedPictureFor(info.file) : null;
    if (animated) {
        if (current !== animated) img.setAttribute('src', animated);
        rememberPicture(img, animated);
        return;
    }
    if (!settings.sharpPictures) {
        if (img.dataset.stmuiThumb && current !== img.dataset.stmuiThumb) img.setAttribute('src', img.dataset.stmuiThumb);
        return;
    }
    const shown = img.getBoundingClientRect().width || img.clientWidth;
    const needed = shown * (window.devicePixelRatio || 1);
    // The thumbnail is 96 pixels wide; only bigger pictures need the original.
    if (needed <= 100) return;
    const width = needed <= 200 ? 200 : needed <= 400 ? 400 : 640;
    sharpPicture(info, width).then(url => swapPicture(img, url)).catch(() => {});
}

function watchPicture(img) {
    if (!img.dataset.stmuiWatched) {
        img.dataset.stmuiWatched = '1';
        pictures.seen?.observe(img);
    }
    scheduleVisibleCheck();
}

/**
 * Backup for the on-screen watcher: after scrolling stops, upgrade the pictures
 * it reported as near the screen that still show a thumbnail. Only those are
 * looked at, so a long chat or character list costs nothing here.
 */
function scheduleVisibleCheck(event) {
    // Text boxes scroll while you type; they never hold pictures.
    if (event?.target instanceof HTMLTextAreaElement || event?.target instanceof HTMLInputElement) return;
    window.clearTimeout(pictures.timer);
    pictures.timer = window.setTimeout(() => {
        if (!active || !(settings.sharpPictures || settings.animatedPictures)) return;
        for (const img of pictures.near) {
            if (!img.isConnected) {
                pictures.near.delete(img);
                continue;
            }
            if (thumbInfo(img.getAttribute('src') ?? '') || (img.dataset.stmuiThumb && img.getAttribute('src') === img.dataset.stmuiThumb)) upgradePicture(img);
        }
    }, 150);
}

function scanPictures(root = document) {
    if (!active) return;
    const images = root.matches?.('img') ? [root] : root.querySelectorAll?.('img') ?? [];
    for (const img of images) {
        const src = img.getAttribute('src') ?? '';
        if (thumbInfo(src)) restoreKnownPicture(img);
        if (thumbInfo(src) || img.dataset.stmuiThumb) watchPicture(img);
    }
}

function syncPictures() {
    const want = active && (settings.sharpPictures || settings.animatedPictures);
    if (!want) {
        pictures.observer?.disconnect();
        pictures.seen?.disconnect();
        document.removeEventListener('scroll', scheduleVisibleCheck, { capture: true });
        pictures.observer = null;
        pictures.seen = null;
        pictures.near.clear();
        pictures.swaps.clear();
        pictures.last.clear();
        pictures.swapFrame = 0;
        // Put SillyTavern's own thumbnails back.
        for (const img of document.querySelectorAll('img[data-stmui-thumb]')) {
            img.setAttribute('src', img.dataset.stmuiThumb);
            delete img.dataset.stmuiThumb;
            delete img.dataset.stmuiWatched;
        }
        document.querySelectorAll('img[data-stmui-watched]').forEach(img => delete img.dataset.stmuiWatched);
        for (const url of pictures.cache.values()) URL.revokeObjectURL(url);
        pictures.cache.clear();
        return;
    }
    if (!pictures.seen) {
        // Only pictures that are (nearly) on screen are upgraded, so long lists stay light.
        pictures.seen = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    pictures.near.add(entry.target);
                    upgradePicture(entry.target);
                } else pictures.near.delete(entry.target);
            }
        }, { rootMargin: '300px' });
    }
    if (!pictures.observer) {
        pictures.observer = new MutationObserver(records => {
            for (const record of records) {
                if (record.type === 'attributes') {
                    const img = record.target;
                    // SillyTavern put a thumbnail back (re-render): upgrade again.
                    if (thumbInfo(img.getAttribute('src') ?? '')) {
                        img.dataset.stmuiThumb = img.getAttribute('src');
                        if (restoreKnownPicture(img)) continue;
                        if (img.dataset.stmuiWatched) {
                            pictures.seen?.unobserve(img);
                            pictures.seen?.observe(img);
                        } else watchPicture(img);
                    }
                    continue;
                }
                for (const node of record.addedNodes) {
                    if (node.nodeType === 1) scanPictures(node);
                }
            }
        });
        pictures.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
        document.addEventListener('scroll', scheduleVisibleCheck, { capture: true, passive: true });
    }
    // Pictures already on the page, and a refresh after the animated picture changed.
    for (const img of document.querySelectorAll('img[data-stmui-watched]')) {
        pictures.seen.unobserve(img);
        pictures.seen.observe(img);
    }
    scanPictures();
}

/** Re-check every picture of one character (after its animated picture changed). */
function refreshPicturesFor(file) {
    for (const img of document.querySelectorAll('img')) {
        const info = thumbInfo(img.getAttribute('src') ?? '') ?? (img.dataset.stmuiThumb ? thumbInfo(img.dataset.stmuiThumb) : null);
        if (info?.file !== file) continue;
        if (!animatedPictureFor(file) && img.dataset.stmuiThumb) img.setAttribute('src', img.dataset.stmuiThumb);
        upgradePicture(img);
    }
    shell?.update();
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

async function setAnimatedPicture(characterId, url) {
    const context = ctx();
    const character = context.characters?.[characterId];
    if (!character) return;
    await context.writeExtensionField?.(characterId, GIF_KEY, url ?? '');
    character.data = character.data ?? {};
    character.data.extensions = character.data.extensions ?? {};
    character.data.extensions[GIF_KEY] = url ?? '';
    refreshPicturesFor(character.avatar);
}

/** True for a GIF, an animated WebP or an animated PNG (looks at the file's own bytes). */
async function isAnimatedImage(file) {
    const head = new Uint8Array(await file.slice(0, 256 * 1024).arrayBuffer());
    const text = (start, length) => String.fromCharCode(...head.subarray(start, start + length));
    if (text(0, 4) === 'GIF8') return true;
    // WebP: RIFF....WEBP with an animation chunk.
    if (text(0, 4) === 'RIFF' && text(8, 4) === 'WEBP') {
        for (let i = 12; i < head.length - 4; i++) {
            if (head[i] === 0x41 && text(i, 4) === 'ANIM') return true;
        }
        return false;
    }
    // PNG: an "acTL" chunk before the image data means APNG.
    if (head[0] === 0x89 && text(1, 3) === 'PNG') {
        for (let i = 8; i < head.length - 4; i++) {
            if (head[i] === 0x61 && text(i, 4) === 'acTL') return true;
            if (head[i] === 0x49 && text(i, 4) === 'IDAT') return false;
        }
    }
    return false;
}

async function uploadAnimatedFile(file, baseName) {
    const extension = (file.type.split('/')[1] ?? 'gif').replace('apng', 'png').replace(/[^a-z0-9]/gi, '') || 'gif';
    const safeName = `stmui-${String(baseName || 'character').replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '_')}-${Date.now()}.${extension}`;
    const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: ctx().getRequestHeaders(),
        body: JSON.stringify({ name: safeName, data: await fileToBase64(file) }),
    });
    if (!response.ok) throw new Error(String(response.status));
    const { path } = await response.json();
    return `/${String(path).replace(/^\/+/, '')}`;
}

/** A picture waiting for its new character to be created. */
let pendingAnimated = null;

/**
 * SillyTavern's own picture picker (tap the character's picture). If the file
 * is animated, Pocket Tavern keeps the moving version next to the still card
 * picture SillyTavern saves; a still picture replaces any earlier animation.
 */
async function onAvatarPicked(event) {
    if (!active || !settings.animatedPictures || event.target?.id !== 'add_avatar_button') return;
    const file = event.target.files?.[0];
    if (!file) return;
    const context = ctx();
    const creating = isShown(document.getElementById('name_div')) || context.characterId === undefined;
    const character = creating ? null : context.characters?.[context.characterId];
    let animated = false;
    try {
        animated = await isAnimatedImage(file);
    } catch {
        animated = false;
    }
    if (!animated) {
        pendingAnimated = null;
        // A still picture replaces the old animation (once SillyTavern has saved the new one).
        if (character && animatedPictureFor(character.avatar)) {
            const id = context.characterId;
            setTimeout(() => setAnimatedPicture(id, ''), 2500);
        }
        return;
    }
    if (file.size > 15 * 1024 * 1024) {
        globalThis.toastr?.warning(t('That picture is too big to animate (over 15 MB); the still picture is used.'));
        return;
    }
    try {
        const url = await uploadAnimatedFile(file, character?.avatar ?? document.getElementById('character_name_pole')?.value);
        if (character) {
            const id = context.characterId;
            // Let SillyTavern finish saving the still picture first, so the two saves don't collide.
            setTimeout(async () => {
                await setAnimatedPicture(id, url);
                globalThis.toastr?.success(t('Animated picture set for {name}.', { name: character.name }));
            }, 2500);
        } else {
            pendingAnimated = { url, avatars: new Set((context.characters ?? []).map(item => item.avatar)), at: Date.now() };
        }
    } catch (error) {
        console.warn(LOG, 'Animated picture upload failed', error);
        globalThis.toastr?.error(t('Could not save the animated picture; the still picture is used.'));
    }
}

/** After a new character is created, give it the animated picture it was created with. */
function applyPendingAnimated() {
    if (!pendingAnimated) return;
    if (Date.now() - pendingAnimated.at > 10 * 60 * 1000) {
        pendingAnimated = null;
        return;
    }
    const characters = ctx().characters ?? [];
    const id = characters.findIndex(item => !pendingAnimated.avatars.has(item.avatar));
    if (id === -1) return;
    const { url } = pendingAnimated;
    pendingAnimated = null;
    setTimeout(() => setAnimatedPicture(id, url), 1500);
}

// -- chat: the message box (persona button, context ring)

/**
 * The message box is one floating rounded box: the text on top, and a row of
 * tools along its bottom. Pocket Tavern adds two things to that row: your
 * persona (picture and name, tap to switch) and a ring that fills as the
 * context fills (tap it for what is in there).
 */
const composer = { persona: null, ring: null, tabs: null, personas: null, formObserver: null };

/** SillyTavern's personas module, loaded once; it knows the current persona. */
function loadPersonasModule() {
    composer.personas ??= import('/scripts/personas.js').catch(() => null);
    return composer.personas;
}

function personaName(avatar) {
    return ctx().powerUserSettings?.personas?.[avatar] || ctx().name1 || '';
}

function personaPicture(avatar) {
    return avatar ? `/thumbnail?type=persona&file=${encodeURIComponent(avatar)}` : 'img/user-default.png';
}

async function updatePersonaButton() {
    const button = composer.persona;
    if (!button) return;
    const module = await loadPersonasModule();
    const avatar = module?.user_avatar || currentPersona();
    const name = personaName(avatar);
    const img = button.querySelector('img');
    const src = personaPicture(avatar);
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    // Set as plain text: a persona's name is never translated.
    button.querySelector('.stmui-persona-name').textContent = name;
    button.setAttribute('aria-label', name ? t('You are {name}. Tap to switch persona.', { name }) : t('Switch persona'));
}

function buildContextRing() {
    const ring = h('button', {
        type: 'button',
        class: 'stmui-ctx-ring stmui-ctx-empty',
        onclick: () => {
            buzz(6);
            openContextSheet();
        },
    }, [h('span', { class: 'stmui-ctx-num', 'aria-hidden': 'true' })]);
    ring.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 36 36" aria-hidden="true"><circle class="stmui-ctx-track" cx="18" cy="18" r="15"/><circle class="stmui-ctx-fill" cx="18" cy="18" r="15" pathLength="100"/></svg>');
    return ring;
}

/**
 * The message box floats over the chat, so the chat scrolls behind it. Its
 * height (it grows as you type) is kept in --stmui-form-h: the chat leaves that
 * much room at the bottom, and the jump button sits just above it.
 */
function watchFormHeight(on) {
    const sheld = document.getElementById('sheld');
    const form = document.getElementById('form_sheld');
    if (!on || !sheld || !form || !('ResizeObserver' in window)) {
        composer.formObserver?.disconnect();
        composer.formObserver = null;
        sheld?.style.removeProperty('--stmui-form-h');
        return;
    }
    if (composer.formObserver) return;
    let last = -1;
    composer.formObserver = new ResizeObserver(() => {
        const height = Math.round(form.offsetHeight);
        if (height === last) return;
        const chat = document.getElementById('chat');
        // Stay at the newest message when the box grows or shrinks.
        const atBottom = chat && chat.scrollHeight - chat.scrollTop - chat.clientHeight < 40;
        last = height;
        sheld.style.setProperty('--stmui-form-h', `${height}px`);
        if (atBottom) requestAnimationFrame(() => chat.scrollTo(0, chat.scrollHeight));
    });
    composer.formObserver.observe(form);
}

function syncComposer() {
    const left = document.getElementById('leftSendForm');
    const right = document.getElementById('rightSendForm');
    const want = active && settings.chatStyle && left && right;
    watchFormHeight(!!want);
    if (!want || !settings.contextMeter) {
        composer.ring?.remove();
        composer.ring = null;
    }
    if (!want || !settings.appShell || !settings.hideTabsInChat) {
        composer.tabs?.remove();
        composer.tabs = null;
    }
    if (!want) {
        composer.persona?.remove();
        composer.persona = null;
        return;
    }
    if (!composer.persona || !composer.persona.isConnected) {
        composer.persona?.remove();
        composer.persona = h('button', {
            type: 'button',
            class: 'stmui-persona-chip',
            title: 'Switch persona',
            onclick: () => {
                buzz(6);
                openPersonaChooser();
            },
        }, [h('img', { class: 'stmui-persona-img', alt: '' }), h('span', { class: 'stmui-persona-name' })]);
        left.prepend(composer.persona);
    }
    if (settings.appShell && settings.hideTabsInChat) {
        if (!composer.tabs || !composer.tabs.isConnected) {
            composer.tabs?.remove();
            composer.tabs = h('button', {
                type: 'button',
                class: 'stmui-tabs-btn',
                'aria-controls': 'stmui-tabbar',
                onclick: () => {
                    buzz(6);
                    shell?.toggleTabs();
                },
            }, [ui('chevron-up')]);
        }
        if (left.firstElementChild !== composer.tabs) left.prepend(composer.tabs);
        syncTabsButton();
    }
    if (settings.contextMeter && (!composer.ring || !composer.ring.isConnected)) {
        composer.ring?.remove();
        composer.ring = buildContextRing();
        right.prepend(composer.ring);
    }
    updatePersonaButton();
    renderMeter();
}

// -- chat: drag the last reply sideways to swipe

const drag = { mes: null, x: 0, y: 0, dx: 0, active: false, hint: null, started: 0 };

function onSwipeStart(event) {
    if (!active || !settings.chatStyle || !settings.dragSwipe || event.touches.length !== 1) return;
    const mes = event.target.closest?.('#chat .mes.last_mes');
    if (!mes || mes.getAttribute('is_user') === 'true' || mes.querySelector('#curEditTextarea')) return;
    if (event.target.closest('textarea, input, button, a, .mes_buttons, .swipe_left, .swipe_right, pre, .mes_reasoning_details')) return;
    drag.mes = mes;
    drag.x = event.touches[0].clientX;
    drag.y = event.touches[0].clientY;
    drag.dx = 0;
    drag.active = false;
    drag.started = Date.now();
}

function onSwipeMove(event) {
    if (!drag.mes) return;
    const x = event.touches[0].clientX - drag.x;
    const y = event.touches[0].clientY - drag.y;
    if (!drag.active) {
        if (Math.abs(y) > 14 && Math.abs(y) > Math.abs(x)) {
            drag.mes = null;
            return;
        }
        if (Math.abs(x) < 16) return;
        drag.active = true;
    }
    drag.dx = Math.max(-150, Math.min(150, x));
    drag.mes.style.transition = 'none';
    drag.mes.style.transform = `translateX(${drag.dx}px) rotate(${drag.dx / 60}deg)`;
    const canPrevious = (() => {
        const left = drag.mes.querySelector('.swipe_left');
        return left && getComputedStyle(left).display !== 'none';
    })();
    const kind = drag.dx < 0 ? 'next' : (canPrevious ? 'previous' : 'none');
    if (!drag.hint || drag.hint.dataset.kind !== kind) {
        drag.hint?.remove();
        drag.hint = kind === 'none' ? null : h('div', { class: `stmui-drag-hint stmui-drag-${kind}`, 'data-kind': kind }, [
            ui(kind === 'next' ? 'chevron-left' : 'chevron-right'),
            h('span', { text: kind === 'next' ? 'Another version' : 'Previous version' }),
        ]);
        if (drag.hint) document.body.append(drag.hint);
    }
    if (drag.hint) {
        const rect = drag.mes.getBoundingClientRect();
        drag.hint.style.top = `${Math.max(rect.top, 70) + Math.min(rect.height, 300) / 2}px`;
        drag.hint.classList.toggle('stmui-drag-ready', Math.abs(drag.dx) > 80);
    }
}

function onSwipeEnd() {
    const mes = drag.mes;
    drag.mes = null;
    if (!mes || !drag.active) return;
    const fast = Math.abs(drag.dx) > 40 && Date.now() - drag.started < 250;
    const go = Math.abs(drag.dx) > 80 || fast;
    mes.style.transition = 'transform 0.25s var(--stmui-ease)';
    mes.style.transform = '';
    setTimeout(() => {
        mes.style.transition = '';
    }, 260);
    drag.hint?.remove();
    drag.hint = null;
    if (!go) return;
    buzz(12);
    const button = mes.querySelector(drag.dx < 0 ? '.swipe_right' : '.swipe_left');
    if (button && getComputedStyle(button).display !== 'none') button.click();
}

/** SillyTavern's own quick-flick swipe would fire as well; let the drag handle it. */
function onSwipedEvent(event) {
    if (active && settings.chatStyle && settings.dragSwipe) event.stopImmediatePropagation();
}

// -- chat: fold very long messages

const LONG_MESSAGE = 2500;

/**
 * The swipe pill shows "1/3" only when there is more than one version. With
 * one, it is just the round "new version" button.
 */
function syncSwipeCounters() {
    requestAnimationFrame(() => {
        const chat = ctx().chat ?? [];
        const all = document.body.classList.contains('swipeAllMessages');
        for (const mes of document.querySelectorAll(all ? '#chat > .mes' : '#chat > .mes.last_mes, #chat > .mes.stmui-one-swipe')) {
            const message = chat[Number(mes.getAttribute('mesid'))];
            mes.classList.toggle('stmui-one-swipe', active && !((message?.swipes?.length ?? 0) > 1));
        }
    });
}

/**
 * "Faster long chats" skips drawing messages that are off screen and guesses
 * their height until they are drawn. Scrolling up into a message drawn for the
 * first time then changed its height, and the chat moved under your finger.
 * So after a chat opens (or its messages change size) every message is drawn
 * once, for one frame; the browser remembers each real height from then on.
 */
const fastChat = { timer: 0, width: 0 };

function primeChatSizes(delay = 0) {
    window.clearTimeout(fastChat.timer);
    fastChat.timer = window.setTimeout(() => {
        const chat = document.getElementById('chat');
        if (!active || !settings.fastChat || !chat) return;
        chat.classList.add('stmui-fast-prime');
        // Drawn in the next frame (heights are remembered then), skipped again after it.
        requestAnimationFrame(() => requestAnimationFrame(() => {
            chat.classList.remove('stmui-fast-prime');
            keepAtNewest();
        }));
    }, delay);
}

/**
 * A chat opens at its newest message. SillyTavern scrolls there once, but then
 * the messages settle (their real heights are measured, long ones fold), and
 * the chat ended up far above the newest message. For a moment after a chat
 * opens, keep it at the newest message, until you scroll yourself.
 */
const newest = { until: 0 };

function keepAtNewest() {
    const chat = document.getElementById('chat');
    if (!chat || Date.now() > newest.until || ctx().getCurrentChatId?.() === undefined) return;
    chat.scrollTop = chat.scrollHeight;
}

function holdAtNewest(ms = 2500) {
    const chat = document.getElementById('chat');
    if (!active || !chat || ctx().powerUserSettings?.auto_scroll_chat_to_bottom === false) return;
    newest.until = Date.now() + ms;
    const stop = () => { newest.until = 0; };
    chat.addEventListener('touchstart', stop, { once: true, passive: true });
    chat.addEventListener('wheel', stop, { once: true, passive: true });
    for (const delay of [60, 250, 500, 900, 1400, 2200]) setTimeout(keepAtNewest, delay);
}

function onChatWidthChange() {
    const width = document.getElementById('chat')?.clientWidth ?? 0;
    if (!width || width === fastChat.width) return;
    fastChat.width = width;
    // A new width wraps every message differently.
    primeChatSizes(250);
}

function foldLongMessages() {
    if (!active || !settings.chatStyle || !settings.foldLong) {
        document.querySelectorAll('#chat .mes.stmui-long, #chat .mes.stmui-long-open').forEach(mes => mes.classList.remove('stmui-long', 'stmui-long-open'));
        document.querySelectorAll('.stmui-more-btn').forEach(node => node.remove());
        return;
    }
    const chat = ctx().chat ?? [];
    let changed = false;
    for (const mes of document.querySelectorAll('#chat > .mes')) {
        const message = chat[Number(mes.getAttribute('mesid'))];
        const text = message?.extra?.display_text ?? message?.mes ?? '';
        const long = text.length > LONG_MESSAGE && !mes.classList.contains('last_mes') && !mes.querySelector('#curEditTextarea');
        if (mes.classList.contains('stmui-long') !== long) changed = true;
        mes.classList.toggle('stmui-long', long);
        let button = mes.querySelector('.stmui-more-btn');
        if (long && !button) {
            button = h('button', {
                type: 'button',
                class: 'stmui-more-btn',
                onclick: () => {
                    const open = mes.classList.toggle('stmui-long-open');
                    button.textContent = open ? t('Show less') : t('Show more');
                    if (!open) mes.scrollIntoView({ block: 'nearest' });
                },
            }, [t('Show more')]);
            mes.querySelector('.mes_text')?.after(button);
        } else if (!long && button) {
            button.remove();
            mes.classList.remove('stmui-long-open');
        }
    }
    // Folding changes heights; let the browser remember the new ones.
    if (changed) primeChatSizes();
}

// -- chat: search inside the chat

const finder = { bar: null, hits: [], index: -1, marks: [] };

function chatFinderOpen() {
    return !!finder.bar;
}

function closeChatFinder() {
    clearFinderMarks();
    document.querySelectorAll('#chat .mes.stmui-flash').forEach(mes => mes.classList.remove('stmui-flash'));
    finder.bar?.remove();
    finder.bar = null;
    finder.hits = [];
    finder.index = -1;
    scheduleHistorySync();
}

function clearFinderMarks() {
    for (const mark of finder.marks) {
        if (!mark.isConnected) continue;
        mark.replaceWith(document.createTextNode(mark.textContent));
    }
    for (const parent of new Set(finder.marks.map(mark => mark.parentElement).filter(Boolean))) parent.normalize?.();
    finder.marks = [];
}

function markInMessage(mes, words) {
    const text = mes.querySelector('.mes_text');
    if (!text) return;
    const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const pattern = new RegExp(words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
    for (const node of nodes) {
        const value = node.nodeValue;
        pattern.lastIndex = 0;
        if (!pattern.test(value)) continue;
        pattern.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let last = 0;
        for (const match of value.matchAll(pattern)) {
            fragment.append(value.slice(last, match.index));
            const mark = h('mark', { class: 'stmui-find-mark', text: match[0] });
            finder.marks.push(mark);
            fragment.append(mark);
            last = match.index + match[0].length;
        }
        fragment.append(value.slice(last));
        node.replaceWith(fragment);
    }
}

async function showFinderHit(index) {
    if (!finder.hits.length) return;
    finder.index = (index + finder.hits.length) % finder.hits.length;
    const id = finder.hits[finder.index];
    finder.bar.querySelector('.stmui-find-count').textContent = `${finder.index + 1}/${finder.hits.length}`;
    // Older messages may not be on the page yet: ask SillyTavern to load more.
    for (let tries = 0; tries < 60 && !document.querySelector(`#chat .mes[mesid="${id}"]`); tries++) {
        const more = document.getElementById('show_more_messages');
        if (!more) break;
        more.click();
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    const mes = document.querySelector(`#chat .mes[mesid="${id}"]`);
    if (!mes) return;
    clearFinderMarks();
    const words = normalizeText(finder.bar.querySelector('input').value).split(/\s+/).filter(Boolean);
    markInMessage(mes, words);
    if (mes.classList.contains('stmui-long') && !mes.classList.contains('stmui-long-open')) {
        mes.classList.add('stmui-long-open');
        const more = mes.querySelector('.stmui-more-btn');
        if (more) more.textContent = t('Show less');
    }
    const firstMark = finder.marks[0];
    (firstMark ?? mes).scrollIntoView({ block: 'center', behavior: motionAllowed() ? 'smooth' : 'auto' });
    mes.classList.remove('stmui-flash');
    void mes.offsetWidth;
    mes.classList.add('stmui-flash');
    window.setTimeout(() => mes.classList.remove('stmui-flash'), 1600);
}

function runChatSearch() {
    const input = finder.bar?.querySelector('input');
    if (!input) return;
    const words = normalizeText(input.value).split(/\s+/).filter(Boolean);
    const chat = ctx().chat ?? [];
    finder.hits = [];
    if (words.length) {
        chat.forEach((message, id) => {
            if (message?.is_system) return;
            const text = normalizeText(`${message.mes ?? ''} ${message.extra?.display_text ?? ''}`);
            if (words.every(word => text.includes(word))) finder.hits.push(id);
        });
    }
    const count = finder.bar.querySelector('.stmui-find-count');
    if (!words.length) count.textContent = '';
    else if (!finder.hits.length) count.textContent = t('None');
    if (finder.hits.length) showFinderHit(finder.hits.length - 1);
    else clearFinderMarks();
}

function openChatFinder() {
    if (finder.bar) {
        finder.bar.querySelector('input').focus();
        return;
    }
    const input = h('input', { type: 'search', class: 'text_pole', placeholder: t('Search this chat'), 'aria-label': t('Search this chat'), enterkeyhint: 'search' });
    let timer = 0;
    input.addEventListener('input', () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(runChatSearch, 250);
    });
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            showFinderHit(finder.index - 1);
        }
    });
    const button = (iconName, label, onclick) => h('button', { type: 'button', class: 'stmui-find-btn', 'aria-label': label, title: label, onclick }, [ui(iconName)]);
    finder.bar = h('div', { class: 'stmui-chat-finder', role: 'search' }, [
        input,
        h('span', { class: 'stmui-find-count' }),
        button('chevron-up', 'Older match', () => showFinderHit(finder.index - 1)),
        button('chevron-down', 'Newer match', () => showFinderHit(finder.index + 1)),
        button('x', 'Close search', () => closeChatFinder()),
    ]);
    shieldFromDrawerAutoClose(finder.bar);
    document.body.append(finder.bar);
    setTimeout(() => input.focus(), 50);
    scheduleHistorySync();
}

// -- chat: how full is the context?

const meter = { used: 0, max: 0, breakdown: null, chatId: null };

function contextMax() {
    const context = ctx();
    return context.mainApi === 'openai' ? Number(context.chatCompletionSettings?.openai_max_context) || 0 : Number(context.maxContext) || 0;
}

/** How many tokens are kept free for the reply. */
function replyLength() {
    const context = ctx();
    if (context.mainApi === 'openai') return Number(context.chatCompletionSettings?.openai_max_tokens) || 0;
    return Number(document.getElementById('amount_gen')?.value) || 0;
}

/** What the prompt itself may use: the context size minus the room kept for the reply. */
function contextAvailable() {
    return Math.max(0, contextMax() - replyLength());
}

async function measurePrompt(text) {
    try {
        const tokens = await ctx().getTokenCountAsync?.(text);
        if (typeof tokens === 'number') {
            meter.used = tokens;
            meter.max = contextAvailable() || contextMax();
            meter.breakdown = null;
            renderMeter();
        }
    } catch {
        // No tokenizer for this API: leave the meter as it was.
    }
}

const CTX_PARTS = {
    system: { label: 'Main prompt and instructions', color: '#94a3b8' },
    character: { label: 'Character, persona and scenario', color: '#a78bfa' },
    examples: { label: 'Example messages', color: '#f5b942' },
    lore: { label: 'Lorebooks', color: '#2dd4bf' },
    history: { label: 'Chat history', color: 'var(--stmui-accent)' },
    notes: { label: "Author's note and extras", color: '#f472b6' },
    bias: { label: 'Bias', color: '#cbd5e1' },
    other: { label: 'Other', color: '#64748b' },
};

/**
 * What filled the context on the last reply, from SillyTavern's own record of
 * each prompt (the same numbers as its Prompt popup). Null before any reply.
 */
async function contextBreakdown() {
    const module = await import('/scripts/itemized-prompts.js').catch(() => null);
    const list = module?.itemizedPrompts;
    const chat = ctx().chat ?? [];
    if (!Array.isArray(list) || !list.length) return null;
    let index = -1;
    for (let i = list.length - 1; i >= 0; i--) {
        if (chat[list[i]?.mesId]) {
            index = i;
            break;
        }
    }
    if (index < 0) return null;
    const entry = list[index];
    const p = await module.itemizedParams(list, index, entry.mesId);
    const n = value => Math.max(0, Math.round(Number(value) || 0));
    let total;
    let available;
    let parts;
    if (p.this_main_api === 'openai') {
        total = n(p.finalPromptTokens);
        available = n(p.thisPrompt_max_context);
        const story = n(p.afterScenarioAnchorTokens) + n(p.beforeScenarioAnchorTokens) + n(p.oaiPromptTokens);
        parts = [
            ['system', n(p.oaiSystemTokens)],
            ['character', Math.max(0, story - n(p.examplesStringTokens))],
            ['examples', n(p.examplesStringTokens)],
            ['lore', n(p.worldInfoStringTokens)],
            ['history', n(p.ActualChatHistoryTokens)],
            ['bias', n(p.oaiBiasTokens)],
        ];
    } else {
        total = n(p.totalTokensInPrompt) || n(p.finalPromptTokens);
        available = n(p.thisPrompt_max_context);
        parts = [
            ['character', n(p.storyStringTokens)],
            ['examples', n(p.examplesStringTokens)],
            ['lore', n(p.worldInfoStringTokens)],
            ['history', n(p.ActualChatHistoryTokens)],
            ['notes', n(p.allAnchorsTokens)],
            ['bias', n(p.promptBiasTokens)],
        ];
    }
    const counted = parts.reduce((sum, [, tokens]) => sum + tokens, 0);
    if (total > counted + 2) parts.push(['other', total - counted]);
    if (!total) total = counted;
    return {
        total,
        available: available || contextAvailable(),
        reply: replyLength(),
        parts: parts.filter(([, tokens]) => tokens > 0).map(([key, tokens]) => ({ key, tokens })),
        character: {
            Description: n(p.charDescriptionTokens),
            Personality: n(p.charPersonalityTokens),
            Scenario: n(p.scenarioTextTokens),
            Persona: n(p.userPersonaStringTokens),
        },
        facts: [
            ['Messages in context', p.messagesCount],
            ['Example messages', p.examplesCount],
            ['Model', p.modelUsed],
            ['Preset', p.presetName],
            ['Connection', p.apiUsed || p.mainApiFriendlyName],
            ['Tokenizer', p.selectedTokenizer],
        ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ''),
        showPrompt: () => module.promptItemize(list, entry.mesId),
    };
}

/** After a chat opens, fill the ring from its last reply right away. */
async function loadMeterFromHistory() {
    if (!active || !settings.contextMeter) return;
    const chatId = ctx().getCurrentChatId?.();
    try {
        const info = await contextBreakdown();
        if (ctx().getCurrentChatId?.() !== chatId) return;
        meter.chatId = chatId;
        if (info) {
            meter.used = info.total;
            meter.max = info.available;
            meter.breakdown = info;
        }
        renderMeter();
    } catch (error) {
        console.debug(LOG, 'Could not read the last prompt', error);
    }
}

function contextShare() {
    return meter.used && meter.max ? Math.min(1, meter.used / meter.max) : 0;
}

/** A ring with the share drawn on it; used in the message box and, bigger, in the Context sheet. */
function paintRing(ring, share, empty) {
    const percent = Math.round(share * 100);
    // A style, not an attribute: the stylesheet's starting value would win over an attribute.
    const fill = ring.querySelector('.stmui-ctx-fill');
    if (fill) fill.style.strokeDasharray = `${empty ? 0 : Math.max(2, percent)} 100`;
    ring.classList.toggle('stmui-ctx-empty', empty);
    ring.classList.toggle('stmui-ctx-warn', !empty && share > 0.85 && share <= 0.98);
    ring.classList.toggle('stmui-ctx-full', !empty && share > 0.98);
    const num = ring.querySelector('.stmui-ctx-num');
    if (num) num.textContent = empty ? '' : `${percent}%`;
}

function onPromptReady(data) {
    if (!active || !settings.contextMeter || data?.dryRun) return;
    if (Array.isArray(data?.chat)) measurePrompt(data.chat.map(item => (typeof item.content === 'string' ? item.content : JSON.stringify(item.content ?? ''))).join('\n'));
    else if (typeof data?.prompt === 'string') measurePrompt(data.prompt);
}

function renderMeter() {
    const ring = composer.ring;
    if (!ring) return;
    const empty = !meter.used || !meter.max;
    const share = contextShare();
    paintRing(ring, share, empty);
    const label = empty ? t('Context: no reply yet. Tap for details.') : t('Context {percent}% full. Tap for details.', { percent: Math.round(share * 100) });
    ring.setAttribute('aria-label', label);
    ring.title = label;
}

/** The Context sheet: how full, what filled it, and where to change it. */
function openContextSheet() {
    const inChat = !!(ctx().groupId || ctx().characterId !== undefined);
    let info = meter.breakdown;
    let loading = inChat && !info;
    let failed = false;
    const instance = new MenuSheet({
        title: t('Context'),
        subtitle: t('What the model reads before it replies'),
        fill: body => fillContextSheet(body, { inChat, info, loading, failed }),
    });
    showSheet(instance);
    if (!loading) return;
    contextBreakdown().then(result => {
        info = result;
        if (result) {
            meter.used = result.total;
            meter.max = result.available;
            meter.breakdown = result;
            renderMeter();
        }
    }).catch(error => {
        failed = true;
        console.debug(LOG, 'Could not read the last prompt', error);
    }).finally(() => {
        loading = false;
        if (sheet === instance) instance.fill = body => fillContextSheet(body, { inChat, info, loading, failed });
        if (sheet === instance) instance.refresh();
    });
}

function fillContextSheet(body, { inChat, info, loading, failed }) {
    if (!inChat) {
        body.append(h('p', { class: 'stmui-menu-foot', text: t('Open a chat first.') }));
        return;
    }
    const fmt = value => Number(value || 0).toLocaleString();
    const total = info?.total ?? meter.used;
    const available = info?.available ?? (meter.max || contextAvailable());
    const reply = info?.reply ?? replyLength();
    const empty = !total || !available;
    const share = empty ? 0 : Math.min(1, total / available);

    // The big ring and the headline.
    const big = h('div', { class: 'stmui-ctx-big' }, [
        h('span', { class: 'stmui-ctx-num' }),
        h('small', { class: 'stmui-ctx-unit', text: empty ? '' : t('full') }),
    ]);
    big.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 36 36" aria-hidden="true"><circle class="stmui-ctx-track" cx="18" cy="18" r="15"/><circle class="stmui-ctx-fill" cx="18" cy="18" r="15" pathLength="100"/></svg>');
    paintRing(big, share, empty);
    if (empty) big.querySelector('.stmui-ctx-num').textContent = '–';
    const head = h('div', { class: 'stmui-ctx-head' });
    if (loading) {
        head.append(h('b', { text: t('Counting…') }));
    } else if (empty) {
        head.append(h('b', { text: t('No reply yet in this chat') }), h('small', { text: t('After the next reply you will see what filled the context: the character, lorebooks, chat history and more.') }));
    } else {
        head.append(
            h('b', { text: t('{used} tokens', { used: fmt(total) }) }),
            h('small', { text: t('of {available} the model can read', { available: fmt(available) }) }),
            h('small', { class: 'stmui-ctx-sub', text: t('{max} context, {reply} kept for the reply', { max: fmt(available + reply), reply: fmt(reply) }) }),
        );
    }
    body.append(h('div', { class: 'stmui-ctx-hero' }, [big, head]));
    if (loading) return;

    // What filled it: one bar, then one row per part.
    if (info?.parts?.length && !empty) {
        const bar = h('div', { class: 'stmui-ctx-bar', role: 'img', 'aria-label': t('What filled the context') });
        for (const part of info.parts) {
            const span = h('span');
            span.style.setProperty('--c', CTX_PARTS[part.key].color);
            span.style.flexBasis = `${(part.tokens / available) * 100}%`;
            bar.append(span);
        }
        body.append(bar);
        const rows = info.parts.map(part => {
            const dot = h('span', { class: 'stmui-ctx-dot' });
            dot.style.setProperty('--c', CTX_PARTS[part.key].color);
            const text = h('span', { class: 'stmui-ctx-name' }, [h('span', { text: CTX_PARTS[part.key].label })]);
            if (part.key === 'character') {
                const pieces = Object.entries(info.character).filter(([, tokens]) => tokens > 0).map(([name, tokens]) => `${t(name)} ${fmt(tokens)}`);
                if (pieces.length) text.append(h('small', { text: pieces.join(', ') }));
            }
            if (part.key === 'history') {
                const count = info.facts.find(([name]) => name === 'Messages in context')?.[1];
                if (count) text.append(h('small', { text: t('{count} messages', { count }) }));
            }
            return h('div', { class: 'stmui-ctx-row' }, [
                dot,
                text,
                h('span', { class: 'stmui-ctx-tok' }, [h('b', { text: fmt(part.tokens) }), h('small', { text: `${Math.max(1, Math.round((part.tokens / available) * 100))}%` })]),
            ]);
        });
        const free = Math.max(0, available - total);
        const freeDot = h('span', { class: 'stmui-ctx-dot stmui-ctx-dot-free' });
        rows.push(h('div', { class: 'stmui-ctx-row stmui-ctx-row-free' }, [
            freeDot,
            h('span', { class: 'stmui-ctx-name' }, [h('span', { text: t('Free space') })]),
            h('span', { class: 'stmui-ctx-tok' }, [h('b', { text: fmt(free) }), h('small', { text: `${Math.round((free / available) * 100)}%` })]),
        ]));
        body.append(h('div', { class: 'stmui-ctx-list' }, rows));
    }

    // A plain-words note on what this means.
    if (!empty) {
        const warn = share > 0.85;
        const note = warn
            ? t('Almost full: the oldest messages are left out so the newest ones fit.')
            : t('Room for about {free} more tokens before older messages start to drop out.', { free: fmt(Math.max(0, available - total)) });
        body.append(h('p', { class: `stmui-ctx-note ${warn ? 'stmui-ctx-note-warn' : ''}`, text: note }));
    }
    if (failed) body.append(h('p', { class: 'stmui-ctx-note stmui-ctx-note-warn', text: t('Could not read the details of the last reply.') }));

    // Facts about the last reply and the settings.
    const facts = [...(info?.facts ?? []).filter(([name]) => name !== 'Messages in context' || !info?.parts?.length)];
    facts.push(['Context size', fmt(available + reply)], ['Kept for the reply', fmt(reply)]);
    body.append(h('div', { class: 'stmui-ctx-facts' }, facts.map(([name, value]) => {
        const fact = h('div', { class: 'stmui-ctx-fact' }, [h('small', { text: name })]);
        // Values (model and preset names) are shown as they are, not translated.
        const strong = document.createElement('b');
        strong.textContent = String(value);
        fact.append(strong);
        return fact;
    })));

    const actions = [];
    if (info?.showPrompt) {
        actions.push(h('button', {
            type: 'button',
            class: 'stmui-ctx-btn',
            onclick: () => {
                closeSheet(true);
                info.showPrompt();
            },
        }, [ui('file-text'), h('span', { text: 'Show the full prompt' })]));
    }
    actions.push(h('button', {
        type: 'button',
        class: 'stmui-ctx-btn',
        onclick: () => {
            closeSheet(true);
            openPage('ai-config-button');
        },
    }, [ui('sliders'), h('span', { text: 'Change context size' })]));
    body.append(h('div', { class: 'stmui-ctx-actions' }, actions));
    if (info) body.append(h('p', { class: 'stmui-menu-foot', text: t('Counted from the last reply in this chat.') }));
}

function meterText() {
    if (!meter.used || !meter.max) return t('Shown after the next reply');
    return t('{used} of {max} tokens ({percent}%)', { used: meter.used.toLocaleString(), max: meter.max.toLocaleString(), percent: Math.round((meter.used / meter.max) * 100) });
}

// -- chat: look (cards, bubbles, flat)

function applyChatLook() {
    const root = document.documentElement;
    if (active && settings.chatStyle && settings.chatLook && settings.chatLook !== 'cards') root.dataset.stmuiLook = settings.chatLook;
    else delete root.dataset.stmuiLook;
}

function chatLookControl() {
    const names = { cards: 'Cards', bubbles: 'Bubbles', flat: 'Flat' };
    return h('div', { class: 'stmui-segmented stmui-look-seg', role: 'group', 'aria-label': 'Chat look' },
        Object.entries(names).map(([look, label]) => h('button', {
            type: 'button',
            class: `stmui-seg ${(settings.chatLook || 'cards') === look ? 'stmui-seg-on' : ''}`,
            'aria-pressed': String((settings.chatLook || 'cards') === look),
            onclick: () => setAppearance('chatLook', look),
        }, [label])));
}

// -- lorebooks: entry cards with keyword chips, full-screen entry editor

const lore = { observer: null, timer: 0 };

/** Keywords of every entry in the open lorebook, from its data (entries build their insides only when opened). */
let loreKeys = { name: '', byUid: new Map() };

async function refreshLoreKeys() {
    const name = document.getElementById('world_editor_select')?.selectedOptions[0]?.textContent?.trim();
    if (!name) return;
    try {
        const data = await ctx().loadWorldInfo?.(name);
        const byUid = new Map();
        for (const entry of Object.values(data?.entries ?? {})) byUid.set(String(entry.uid), Array.isArray(entry.key) ? entry.key : []);
        loreKeys = { name, byUid };
    } catch {
        // Keep what we had.
    }
}

function entryKeys(entry) {
    const fromData = loreKeys.byUid.get(String(entry.getAttribute('uid')));
    if (fromData) return fromData.map(key => String(key).trim()).filter(Boolean);
    const field = entry.querySelector('textarea[name="key"]');
    let keys = field?.value ? field.value.split(',') : [];
    if (!keys.length) {
        const select = entry.querySelector('select[name="key"]');
        keys = Array.from(select?.selectedOptions ?? []).map(option => option.value);
    }
    return keys.map(key => key.trim()).filter(Boolean);
}

async function decorateEntries() {
    const list = document.getElementById('world_popup_entries_list');
    if (!list) return;
    await refreshLoreKeys();
    for (const entry of list.querySelectorAll('.world_entry')) {
        // The content block uses the same class, so ask for the one in the header.
        const header = entry.querySelector('.inline-drawer-header > .world_entry_thin_controls');
        if (!header) continue;
        let chips = header.querySelector('.stmui-entry-keys');
        if (!chips) {
            chips = h('div', { class: 'stmui-entry-keys' });
            header.append(chips);
        }
        const keys = entryKeys(entry);
        const signature = keys.join('\u0001');
        if (chips.dataset.keys !== signature) {
            chips.dataset.keys = signature;
            chips.replaceChildren(...keys.slice(0, 8).map(key => h('span', { class: 'stmui-key-chip', text: key })),
                ...(keys.length > 8 ? [h('span', { class: 'stmui-key-chip stmui-key-more', text: `+${keys.length - 8}` })] : []));
            chips.hidden = !keys.length;
        }
        const content = entry.querySelector('.inline-drawer-content');
        const open = !!content && content.style.display !== 'none' && getComputedStyle(content).display !== 'none';
        if (entry.classList.contains('stmui-entry-open') !== open) {
            entry.classList.toggle('stmui-entry-open', open);
            scheduleHistorySync();
        }
    }
    const anyOpen = !!list.querySelector('.world_entry.stmui-entry-open');
    document.documentElement.classList.toggle('stmui-entry-editing', anyOpen);
}

function openLoreEntry() {
    return document.querySelector('#world_popup_entries_list .world_entry.stmui-entry-open');
}

function closeLoreEntry() {
    const entry = openLoreEntry();
    entry?.querySelector('.world_entry_thin_controls > .inline-drawer-toggle')?.click();
    setTimeout(decorateEntries, 50);
    setTimeout(decorateEntries, 400);
}

function syncLoreEntries() {
    const list = document.getElementById('world_popup_entries_list');
    const want = active && settings.touchSizing && settings.loreCards;
    document.documentElement.classList.toggle('stmui-lorecards', !!want);
    if (!want) {
        lore.observer?.disconnect();
        lore.observer = null;
        document.querySelectorAll('.stmui-entry-keys').forEach(node => node.remove());
        document.querySelectorAll('.world_entry.stmui-entry-open').forEach(node => node.classList.remove('stmui-entry-open'));
        document.documentElement.classList.remove('stmui-entry-editing');
        return;
    }
    if (list && !lore.observer) {
        lore.observer = new MutationObserver(records => {
            if (records.every(record => record.target.closest?.('.stmui-entry-keys'))) return;
            window.clearTimeout(lore.timer);
            lore.timer = window.setTimeout(decorateEntries, 120);
        });
        lore.observer.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
        list.addEventListener('input', event => {
            if (event.target.matches?.('textarea[name="key"]')) {
                window.clearTimeout(lore.timer);
                lore.timer = window.setTimeout(decorateEntries, 300);
            }
        });
    }
    decorateEntries();
}

// -- presets: prompt triggers as chips

function syncTriggerChips() {
    const select = document.getElementById('completion_prompt_manager_popup_entry_form_injection_trigger');
    if (!select) return;
    let chips = document.getElementById('stmui_trigger_chips');
    const want = active && settings.touchSizing;
    if (!want) {
        chips?.remove();
        select.classList.remove('stmui-native-hidden');
        return;
    }
    if (!chips) {
        chips = h('div', { id: 'stmui_trigger_chips', class: 'stmui-trigger-chips', role: 'group', 'aria-label': 'Triggers' });
        chips.addEventListener('click', event => {
            const chip = event.target.closest('.stmui-trigger-chip');
            if (!chip) return;
            const option = Array.from(select.options).find(item => item.value === chip.dataset.value);
            if (!option) return;
            option.selected = !option.selected;
            $j()(select).trigger('change');
            select.dispatchEvent(new Event('change', { bubbles: true }));
            buzz(6);
            syncTriggerChips();
        });
        select.after(chips);
        select.classList.add('stmui-native-hidden');
    }
    const none = !Array.from(select.options).some(option => option.selected);
    chips.replaceChildren(...Array.from(select.options).map(option => h('button', {
        type: 'button',
        class: `stmui-trigger-chip ${option.selected ? 'stmui-trigger-on' : ''}`,
        'data-value': option.value,
        'aria-pressed': String(option.selected),
    }, [option.textContent.trim()])), h('small', { class: 'stmui-trigger-note', text: none ? t('None picked: used for every kind of reply.') : '' }));
}

// -- sliders: − and + beside the number

function stepButton(input, direction) {
    const onclick = () => {
        const before = input.value;
        try {
            if (direction > 0) input.stepUp();
            else input.stepDown();
        } catch {
            const size = Number(input.step) || 1;
            input.value = String(Number(input.value || 0) + direction * size);
        }
        if (input.value === before) return;
        buzz(4);
        // Move the slider itself, the way SillyTavern does after typing a number.
        const master = input.dataset.for ? document.getElementById(input.dataset.for) : null;
        if (master) $j()(master).val(input.value).trigger('input', { forced: true });
        else $j()(input).trigger('input').trigger('change');
    };
    return direction > 0
        ? h('button', { type: 'button', class: 'stmui-step stmui-step-up', 'aria-label': 'More', onclick }, ['+'])
        : h('button', { type: 'button', class: 'stmui-step stmui-step-down', 'aria-label': 'Less', onclick }, ['−']);
}

function addSliderSteppers(root = document) {
    if (!active || !settings.touchSizing) return;
    // Chat Completion sliders keep their number in a .range-block-counter box.
    for (const counter of root.querySelectorAll('.range-block-counter')) {
        const input = counter.querySelector('input[type="number"]');
        if (!input || counter.querySelector('.stmui-step')) continue;
        counter.classList.add('stmui-stepper');
        counter.prepend(stepButton(input, -1));
        counter.append(stepButton(input, 1));
    }
    // Text Completion, KoboldAI and NovelAI sliders have a bare number box; wrap it.
    for (const input of root.querySelectorAll('input.neo-range-input[type="number"]')) {
        if (input.closest('.range-block-counter, .stmui-step-wrap')) continue;
        const wrap = h('span', { class: 'stmui-step-wrap' });
        input.before(wrap);
        wrap.append(stepButton(input, -1), input, stepButton(input, 1));
    }
}

function removeSliderSteppers() {
    document.querySelectorAll('.stmui-step-wrap').forEach(wrap => {
        const input = wrap.querySelector('input');
        if (input) wrap.before(input);
        wrap.remove();
    });
    document.querySelectorAll('.stmui-step').forEach(node => node.remove());
    document.querySelectorAll('.range-block-counter.stmui-stepper').forEach(node => node.classList.remove('stmui-stepper'));
}

// -- long-press a message for its menu

const press = { timer: 0, x: 0, y: 0, fired: 0 };

function onMessagePressStart(event) {
    if (!active || !settings.messageMenu || !settings.longPress || event.pointerType === 'mouse') return;
    const message = event.target.closest?.('#chat .mes');
    if (!message || event.target.closest('textarea, input, a, button, .mes_button, .menu_button, .avatar, .swipe_left, .swipe_right, .mes_reasoning_summary, #curEditTextarea')) return;
    if (message.querySelector('#curEditTextarea')) return;
    window.clearTimeout(press.timer);
    press.x = event.clientX;
    press.y = event.clientY;
    press.timer = window.setTimeout(() => {
        press.timer = 0;
        press.fired = Date.now();
        window.getSelection?.()?.removeAllRanges();
        buzz(15);
        openMessageMenu(message);
    }, 520);
}

function onMessagePressMove(event) {
    if (press.timer && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) {
        window.clearTimeout(press.timer);
        press.timer = 0;
    }
}

function onMessagePressEnd() {
    window.clearTimeout(press.timer);
    press.timer = 0;
}

/** After a long-press opened the menu, swallow the tap and the system menu that follow. */
function onPressAfterEffects(event) {
    if (press.fired && Date.now() - press.fired < 700) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}

// -- "can't reach SillyTavern" banner

const server = { down: false, timer: 0, banner: null, busy: false };

async function serverReachable() {
    try {
        // Any answer at all means the server is up; only a network failure counts.
        await fetch('/api/ping', { method: 'POST', headers: ctx().getRequestHeaders?.() ?? {}, cache: 'no-store' });
        return true;
    } catch {
        return false;
    }
}

function scheduleServerCheck(delay) {
    window.clearTimeout(server.timer);
    if (!active || !settings.serverWatch) return;
    server.timer = window.setTimeout(checkServer, delay);
}

async function checkServer() {
    if (!active || !settings.serverWatch || server.busy) return;
    if (document.visibilityState !== 'visible') {
        scheduleServerCheck(30000);
        return;
    }
    server.busy = true;
    const up = await serverReachable();
    server.busy = false;
    if (!up && !server.down) {
        server.down = true;
        showServerBanner();
    } else if (up && server.down) {
        server.down = false;
        showServerBanner(true);
    }
    // Check often while it is down, rarely while all is well.
    scheduleServerCheck(server.down ? 3000 : 30000);
}

function showServerBanner(back = false) {
    server.banner?.remove();
    server.banner = null;
    if (!active) return;
    const banner = h('div', { class: `stmui-banner ${back ? 'stmui-banner-ok' : ''}`, role: 'status', 'aria-live': 'polite' }, [
        ui(back ? 'circle-check' : 'plug', 'stmui-banner-icon'),
        h('span', { class: 'stmui-banner-text' }, back
            ? [h('b', { text: t('Back online') })]
            : [h('b', { text: t("Can't reach SillyTavern") }), h('small', { text: t('Is Termux still running? This reconnects by itself when the server is back.') })]),
        back ? null : h('button', {
            type: 'button',
            class: 'stmui-banner-btn',
            onclick: () => {
                buzz(8);
                checkServer();
            },
        }, [t('Retry')]),
    ]);
    shieldFromDrawerAutoClose(banner);
    document.body.append(banner);
    server.banner = banner;
    if (back) {
        setTimeout(() => {
            if (server.banner === banner) {
                banner.classList.add('stmui-banner-out');
                setTimeout(() => banner.remove(), 250);
                server.banner = null;
            }
        }, 2200);
    }
}

function syncServerWatch() {
    if (active && settings.serverWatch) scheduleServerCheck(server.down ? 1000 : 5000);
    else {
        window.clearTimeout(server.timer);
        server.down = false;
        server.banner?.remove();
        server.banner = null;
    }
}

// -- choice sheets (quick switcher)

/**
 * A sheet that lists choices with a search box when the list is long.
 * @param {{ title: string, subtitle?: string, options: { value: string, label: string, note?: string, image?: string }[], current?: string, onPick: (value: string) => void }} config
 */
function openChoiceSheet({ title, subtitle = '', options, current, onPick }) {
    showSheet(new MenuSheet({
        title,
        subtitle,
        fill: body => {
            const rows = options.map(option => {
                const on = option.value === current;
                return h('button', {
                    type: 'button',
                    class: `stmui-menu-row stmui-choice ${on ? 'stmui-choice-on' : ''}`,
                    'data-search': normalizeText(`${option.label} ${option.note ?? ''}`),
                    'aria-pressed': String(on),
                    onclick: () => {
                        closeSheet(true);
                        if (option.value !== current) onPick(option.value);
                    },
                }, [
                    option.image ? h('img', { class: 'stmui-choice-img', src: option.image, alt: '', loading: 'lazy' }) : null,
                    h('span', { class: 'stmui-row-text' }, [
                        h('span', { text: option.label }),
                        option.note ? h('small', { text: option.note }) : null,
                    ]),
                    on ? ui('check', 'stmui-menu-row-icon') : null,
                ]);
            });
            if (options.length > 8) {
                const search = h('input', { type: 'search', class: 'text_pole stmui-choice-search', placeholder: t('Search'), 'aria-label': t('Search') });
                search.addEventListener('input', () => {
                    const words = normalizeText(search.value).split(/\s+/).filter(Boolean);
                    for (const row of rows) row.hidden = !words.every(word => row.dataset.search.includes(word));
                });
                body.append(search);
            }
            if (!options.length) body.append(h('p', { class: 'stmui-menu-foot', text: t('Nothing to choose from here yet.') }));
            body.append(h('div', { class: 'stmui-menu-list' }, rows));
            requestAnimationFrame(() => body.querySelector('.stmui-choice-on')?.scrollIntoView({ block: 'center' }));
        },
    }));
}

/** Is this control on screen in its page, i.e. not inside a section SillyTavern has hidden? */
function inActiveSection(element, root) {
    for (let node = element; node && node !== root; node = node.parentElement) {
        if (node.classList?.contains('displayNone') || node.style?.display === 'none') return false;
    }
    return true;
}

function optionsOf(select) {
    return Array.from(select.options)
        .filter(option => !option.disabled && !option.hidden && option.value !== '')
        .map(option => ({ value: option.value, label: option.textContent.trim() || option.value, note: option.parentElement?.tagName === 'OPTGROUP' ? option.parentElement.label : '' }));
}

function pickFromSelect(select, value) {
    select.value = value;
    $j()(select).trigger('change');
    select.dispatchEvent(new Event('input', { bubbles: true }));
}

const PRESET_SELECTS = {
    openai: '#settings_preset_openai',
    kobold: '#settings_preset',
    koboldhorde: '#settings_preset',
    novel: '#settings_preset_novel',
    textgenerationwebui: '#settings_preset_textgenerationwebui',
};

function currentPresetSelect() {
    const id = PRESET_SELECTS[ctx().mainApi];
    return id ? document.querySelector(id) : null;
}

function currentModelSelect() {
    const block = document.getElementById('rm_api_block');
    if (!block) return null;
    const candidates = Array.from(block.querySelectorAll('select[id^="model_"], select[id$="_model"], select[id*="model_select"]'))
        .filter(select => !select.multiple && inActiveSection(select, block) && select.options.length > 1);
    return candidates[0] ?? null;
}

function personaChoices() {
    const power = ctx().powerUserSettings ?? {};
    const names = power.personas ?? {};
    const descriptions = power.persona_descriptions ?? {};
    return Object.entries(names).map(([avatar, name]) => ({
        value: avatar,
        label: name || avatar,
        note: (descriptions[avatar]?.description ?? '').replace(/\s+/g, ' ').slice(0, 70),
        image: `/thumbnail?type=persona&file=${encodeURIComponent(avatar)}`,
    })).sort((a, b) => a.label.localeCompare(b.label));
}

function currentPersona() {
    const src = document.querySelector('#user_avatar_block .avatar-container.selected')?.dataset.avatarId;
    return src ?? globalThis.user_avatar ?? '';
}

async function choosePersona(avatar) {
    try {
        const personas = await import('/scripts/personas.js');
        await personas.setUserAvatar(avatar);
    } catch (error) {
        console.warn(LOG, 'Could not switch persona', error);
        globalThis.toastr?.error(t('Open Personas to switch instead.'), t('Could not switch persona'));
    }
}

/**
 * Your persona: the current one as a card with an Edit button, then the others
 * to switch to, then a way to all persona settings.
 */
async function openPersonaChooser() {
    const module = await loadPersonasModule();
    const instance = new MenuSheet({
        title: t('Your persona'),
        subtitle: t('Who you are in the chat'),
        fill: body => {
            // Read fresh each time: after switching, the sheet redraws with the new persona.
            const current = module?.user_avatar || currentPersona();
            const all = personaChoices();
            const description = ctx().powerUserSettings?.persona_descriptions?.[current]?.description ?? '';
            const name = h('b', { class: 'stmui-persona-card-name' });
            name.textContent = personaName(current) || t('No name');
            const note = h('small', { class: 'stmui-persona-card-desc' });
            note.textContent = description.replace(/\s+/g, ' ').trim() || t('No description yet.');
            body.append(h('div', { class: 'stmui-persona-card' }, [
                h('img', { class: 'stmui-persona-card-img', src: personaPicture(current), alt: '' }),
                h('span', { class: 'stmui-persona-card-text' }, [name, note]),
                h('button', {
                    type: 'button',
                    class: 'stmui-persona-card-edit',
                    onclick: () => {
                        buzz(6);
                        openPersonaEditor(current);
                    },
                }, [ui('pencil'), h('span', { text: 'Edit' })]),
            ]));
            const others = all.filter(option => option.value !== current);
            if (others.length) {
                body.append(h('p', { class: 'stmui-menu-heading', text: t('Switch to') }));
                const rows = others.map(option => h('button', {
                    type: 'button',
                    class: 'stmui-menu-row stmui-choice',
                    'data-search': normalizeText(`${option.label} ${option.note ?? ''}`),
                    onclick: async () => {
                        // Stay open: you see the switch and can switch again.
                        buzz(8);
                        await choosePersona(option.value);
                        if (sheet === instance) instance.refresh();
                    },
                }, [
                    h('img', { class: 'stmui-choice-img', src: option.image, alt: '', loading: 'lazy' }),
                    h('span', { class: 'stmui-row-text' }, [h('span', { text: option.label }), option.note ? h('small', { text: option.note }) : null]),
                ]));
                if (others.length > 8) {
                    const search = h('input', { type: 'search', class: 'text_pole stmui-choice-search', placeholder: t('Search'), 'aria-label': t('Search') });
                    search.addEventListener('input', () => {
                        const words = normalizeText(search.value).split(/\s+/).filter(Boolean);
                        for (const row of rows) row.hidden = !words.every(word => row.dataset.search.includes(word));
                    });
                    body.append(search);
                }
                body.append(h('div', { class: 'stmui-menu-list' }, rows));
            }
            body.append(h('div', { class: 'stmui-menu-list' }, [h('button', {
                type: 'button',
                class: 'stmui-menu-row',
                onclick: () => {
                    closeSheet(true);
                    document.querySelector('#persona-management-button > .drawer-toggle')?.click();
                },
            }, [ui('settings', 'stmui-menu-row-icon'), h('span', { text: 'All persona settings' }), ui('chevron-right', 'stmui-menu-row-go')])]));
        },
    });
    showSheet(instance);
}

/** A quick editor for the current persona: its name and description. */
function openPersonaEditor(avatar) {
    const power = ctx().powerUserSettings ?? {};
    const startName = power.personas?.[avatar] ?? '';
    const startText = power.persona_descriptions?.[avatar]?.description ?? (avatar === currentPersona() ? power.persona_description ?? '' : '');
    const nameInput = h('input', { type: 'text', class: 'text_pole stmui-pe-name', 'aria-label': t('Name'), maxlength: '100', enterkeyhint: 'next' });
    nameInput.value = startName;
    const textInput = h('textarea', { class: 'text_pole stmui-pe-text', rows: '8', 'aria-label': t('Description'), placeholder: t('Who are you? Looks, personality, anything the character should know about you.') });
    textInput.value = startText;
    const count = h('small', { class: 'stmui-pe-count' });
    let countTimer = 0;
    const recount = () => {
        window.clearTimeout(countTimer);
        countTimer = window.setTimeout(async () => {
            try {
                const tokens = await ctx().getTokenCountAsync?.(textInput.value);
                if (typeof tokens === 'number') count.textContent = t('{count} tokens', { count: tokens.toLocaleString() });
            } catch {
                count.textContent = '';
            }
        }, 300);
    };
    textInput.addEventListener('input', () => {
        fitTextarea(textInput);
        recount();
    });
    const save = async () => {
        const newName = nameInput.value.trim();
        if (!newName) {
            globalThis.toastr?.warning(t('Give your persona a name.'));
            nameInput.focus();
            return;
        }
        try {
            await savePersonaEdits(avatar, { name: newName, nameChanged: newName !== startName, text: textInput.value, textChanged: textInput.value !== startText });
            closeSheet();
            globalThis.toastr?.success(newName, t('Persona saved'), { timeOut: 1800 });
        } catch (error) {
            console.warn(LOG, 'Could not save the persona', error);
            globalThis.toastr?.error(t('Open Personas to edit it instead.'), t('Could not save the persona'));
        }
    };
    showSheet(new MenuSheet({
        title: t('Edit persona'),
        subtitle: t('Name and description'),
        fill: body => {
            body.append(h('div', { class: 'stmui-pe' }, [
                h('div', { class: 'stmui-pe-top' }, [
                    h('img', { class: 'stmui-persona-card-img', src: personaPicture(avatar), alt: '' }),
                    h('label', { class: 'stmui-pe-field' }, [h('small', { text: 'Name' }), nameInput]),
                ]),
                h('label', { class: 'stmui-pe-field' }, [h('span', { class: 'stmui-pe-label' }, [h('small', { text: 'Description' }), count]), textInput]),
                h('div', { class: 'stmui-pe-actions' }, [
                    h('button', { type: 'button', class: 'stmui-pe-btn', onclick: () => closeSheet() }, [h('span', { text: 'Cancel' })]),
                    h('button', { type: 'button', class: 'stmui-pe-btn stmui-pe-save', onclick: save }, [ui('check'), h('span', { text: 'Save' })]),
                ]),
            ]));
            requestAnimationFrame(() => fitTextarea(textInput));
            recount();
        },
    }));
}

/** Writes the edits the same way SillyTavern's Personas page does. */
async function savePersonaEdits(avatar, { name, nameChanged, text, textChanged }) {
    const context = ctx();
    const power = context.powerUserSettings;
    const personas = await loadPersonasModule();
    const isCurrent = (personas?.user_avatar || currentPersona()) === avatar;
    if (textChanged) {
        if (isCurrent) {
            // SillyTavern's own description box saves it (and its token count) on input.
            const box = document.getElementById('persona_description');
            if (!box) throw new Error('No persona description box');
            box.value = text;
            box.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            power.persona_descriptions[avatar] = { ...(power.persona_descriptions[avatar] ?? {}), description: text };
        }
    }
    if (nameChanged) {
        const oldName = power.personas[avatar];
        power.personas[avatar] = name;
        if (isCurrent) {
            const script = await import('/script.js');
            script.setUserName?.(name, { toastPersonaNameChange: false });
        }
        await context.eventSource?.emit?.(context.eventTypes?.PERSONA_RENAMED ?? 'persona_renamed', { avatarId: avatar, oldName, newName: name });
    }
    context.saveSettingsDebounced?.();
    await personas?.getUserAvatars?.(true, avatar);
    personas?.setPersonaDescription?.();
    updatePersonaButton();
}

function openQuickSwitch() {
    showSheet(new MenuSheet({
        title: t('Quick switch'),
        subtitle: t('Change who you are, the connection, the model or the preset.'),
        fill: body => {
            const rows = [];
            const row = (iconName, label, value, onclick, disabled = false) => h('button', {
                type: 'button', class: 'stmui-menu-row', disabled, onclick,
            }, [
                ui(iconName, 'stmui-menu-row-icon'),
                h('span', { class: 'stmui-row-text' }, [h('span', { text: label }), h('small', { text: value || t('Not set') })]),
                ui('chevron-right', 'stmui-menu-row-go'),
            ]);
            const personaName = document.getElementById('your_name')?.textContent?.trim();
            rows.push(row('smile', t('Persona'), personaName, () => openPersonaChooser()));
            const profiles = document.getElementById('connection_profiles');
            if (profiles && optionsOf(profiles).length) {
                rows.push(row('plug', t('Connection profile'), profiles.selectedOptions[0]?.textContent.trim(), () => openChoiceSheet({
                    title: t('Connection profile'),
                    options: optionsOf(profiles),
                    current: profiles.value,
                    onPick: value => pickFromSelect(profiles, value),
                })));
            }
            const model = currentModelSelect();
            if (model) {
                rows.push(row('flask', t('Model'), model.selectedOptions[0]?.textContent.trim(), () => openChoiceSheet({
                    title: t('Model'),
                    options: optionsOf(model),
                    current: model.value,
                    onPick: value => {
                        pickFromSelect(model, value);
                        globalThis.toastr?.success(model.selectedOptions[0]?.textContent.trim() ?? value, t('Model'), { timeOut: 2000 });
                    },
                })));
            }
            const preset = currentPresetSelect();
            if (preset) {
                rows.push(row('sliders', t('Preset'), preset.selectedOptions[0]?.textContent.trim(), () => openChoiceSheet({
                    title: t('Preset'),
                    options: Array.from(preset.options).filter(option => !option.disabled).map(option => ({ value: option.value, label: option.textContent.trim() })),
                    current: preset.value,
                    onPick: value => pickFromSelect(preset, value),
                })));
            }
            if (settings.contextMeter) rows.push(row('chart', t('Context used'), meterText(), () => openContextSheet()));
            const status = ctx().onlineStatus;
            rows.push(row('globe', t('API connection'), status && status !== 'no_connection' ? t('Connected') : t('Not connected'), () => {
                closeSheet(true);
                openPage('sys-settings-button');
            }));
            body.append(h('div', { class: 'stmui-menu-list' }, rows));
        },
    }));
}

// -- find a setting

const SEARCH_PAGES = ['ai-config-button', 'sys-settings-button', 'advanced-formatting-button', 'user-settings-button', 'extensions-settings-button'];

function ownText(element) {
    let text = '';
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: node => (node.parentElement?.closest('select, option, textarea, script, style, .stmui-skip') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    while (walker.nextNode() && text.length < 160) text += ` ${walker.currentNode.nodeValue}`;
    return text.replace(/\s+/g, ' ').trim();
}

function settingSection(row, root) {
    const parts = [];
    const drawer = row.closest('.inline-drawer');
    if (drawer && root.contains(drawer)) {
        const header = drawer.querySelector(':scope > .inline-drawer-header, :scope > .inline-drawer-toggle');
        const text = header ? ownText(header) : '';
        if (text) parts.push(text);
    }
    let heading = null;
    for (const candidate of root.querySelectorAll('h2, h3, h4, h5, .standoutHeader')) {
        if (candidate.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING) heading = candidate;
        else break;
    }
    const headingText = heading ? ownText(heading) : '';
    if (headingText && !parts.includes(headingText)) parts.unshift(headingText);
    return parts.join(' › ').slice(0, 80);
}

function settingItems(root) {
    const items = [];
    const seen = new Set();
    const labels = new Set();
    for (const control of root.querySelectorAll('input:not([type="hidden"]):not([type="file"]), select, textarea, .menu_button, .checkbox_label')) {
        if (control.closest('.template_element, #stmui-sheet')) continue;
        if (!inActiveSection(control, root)) continue;
        let row = control;
        let label = '';
        for (let depth = 0; depth < 5 && row && row !== root; depth++, row = row.parentElement) {
            label = ownText(row) || (row === control ? (control.getAttribute('title') || control.getAttribute('placeholder') || '') : '');
            if (label.length >= 2) break;
        }
        if (!row || row === root || label.length < 2 || seen.has(row)) continue;
        seen.add(row);
        const section = settingSection(row, root);
        const key = `${label}|${section}`;
        if (labels.has(key)) continue;
        labels.add(key);
        items.push({ row, label: label.length > 90 ? `${label.slice(0, 90)}…` : label, section, search: normalizeText(`${label} ${section}`) });
    }
    return items;
}

function revealSetting(row) {
    const section = row.closest('[data-stmui-sec]')?.dataset.stmuiSec;
    if (section && setnav.home && setnav.view !== section) openSettingsSection(section);
    // Open any folded sections around it first.
    for (let node = row.parentElement; node; node = node.parentElement) {
        if (node.classList?.contains('inline-drawer-content') && getComputedStyle(node).display === 'none') {
            node.closest('.inline-drawer')?.querySelector(':scope > .inline-drawer-toggle, :scope > .inline-drawer-header')?.click();
        }
    }
    setTimeout(() => {
        row.scrollIntoView({ block: 'center', behavior: motionAllowed() ? 'smooth' : 'auto' });
        row.classList.remove('stmui-flash');
        void row.offsetWidth;
        row.classList.add('stmui-flash');
        setTimeout(() => row.classList.remove('stmui-flash'), 2000);
    }, 260);
}

function openSettingSearch() {
    const pageId = currentPageId();
    const root = pageId && document.querySelector(`#${pageId} > .drawer-content`);
    if (!root) return;
    const items = settingItems(root);
    const title = pageInfo(drawerById(pageId)).title;
    showSheet(new MenuSheet({
        title: t('Find a setting'),
        subtitle: t('In {page}', { page: t(title) }),
        fill: body => {
            const input = h('input', { type: 'search', class: 'text_pole stmui-choice-search', placeholder: t('Type a setting name…'), 'aria-label': t('Find a setting'), enterkeyhint: 'search' });
            const list = h('div', { class: 'stmui-menu-list' });
            const foot = h('p', { class: 'stmui-menu-foot' });
            const render = () => {
                const words = normalizeText(input.value).split(/\s+/).filter(Boolean);
                const hits = words.length ? items.filter(item => words.every(word => item.search.includes(word))).slice(0, 60) : [];
                list.replaceChildren(...hits.map(item => h('button', {
                    type: 'button',
                    class: 'stmui-menu-row',
                    onclick: () => {
                        closeSheet(true);
                        revealSetting(item.row);
                    },
                }, [
                    ui('search', 'stmui-menu-row-icon'),
                    h('span', { class: 'stmui-row-text' }, [h('span', { text: item.label }), item.section ? h('small', { text: item.section }) : null]),
                ])));
                list.hidden = !hits.length;
                foot.textContent = !words.length ? t('{count} settings on this page.', { count: items.length }) : (hits.length ? '' : t('No setting matches that.'));
            };
            input.addEventListener('input', render);
            body.append(input, list, foot);
            render();
            setTimeout(() => input.focus(), 250);
        },
    }));
}

// -- settings: sections and descriptions

/**
 * SillyTavern's User Settings page is one long list of about a hundred controls.
 * On a phone it opens on a short list of sections instead, like a phone's own
 * Settings app, and a section shows only its own controls. Nothing is moved:
 * each control is marked with its section and the others are hidden.
 */
const SETTINGS_SECTIONS = [
    { id: 'look', icon: 'palette', title: 'Look', note: 'Theme, colors, avatars, text size and chat width' },
    { id: 'display', icon: 'eye', title: 'Display', note: 'Timestamps, token counts, icons and effects' },
    { id: 'chat', icon: 'chat', title: 'Chat', note: 'Sending, streaming, swipes and replies' },
    { id: 'characters', icon: 'users', title: 'Characters', note: 'Character list, card import and avatars' },
    { id: 'other', icon: 'sliders', title: 'Sounds and more', note: 'Sounds, smooth streaming, tools and window layout' },
    { id: 'css', icon: 'brush', title: 'Custom CSS', note: 'Your own style rules' },
    { id: 'stscript', icon: 'scroll', title: 'STscript', note: 'How slash commands are read' },
];

const setnav = { view: 'home', home: null, marked: [] };

function settingsBlock() {
    return document.getElementById('user-settings-block');
}

/** Marks SillyTavern's settings with their section; false when the page is not laid out as expected. */
function markSettingsSections(block) {
    const content = block.querySelector('#user-settings-block-content');
    if (!content) return false;
    const mark = (element, id) => {
        if (!element || element.dataset.stmuiSec) return;
        element.dataset.stmuiSec = id;
        setnav.marked.push(element);
    };
    const theme = content.querySelector('#UI-Theme-Block');
    mark(theme?.querySelector('#UI-presets-block'), 'look');
    for (const child of theme?.querySelector(':scope > .flexNoGap')?.children ?? []) {
        mark(child, child.querySelectorAll(':scope > label.checkbox_label').length >= 5 ? 'display' : 'look');
    }
    for (const group of content.querySelectorAll('#UI-Customization > div')) {
        if (group.querySelector('#aux_field, #tag_import_setting')) mark(group, 'characters');
        else for (const child of group.children) mark(child, child.id === 'CustomCSS-block' ? 'css' : 'other');
    }
    for (const group of content.querySelectorAll('#power-user-option-checkboxes > *')) {
        mark(group, group.querySelector('[id^="stscript_"]') ? 'stscript' : 'chat');
    }
    // Anything else (a newer SillyTavern, another extension) goes to "Sounds and more", so nothing gets lost.
    const sweep = parent => {
        for (const child of parent.children) {
            if (child.dataset.stmuiSec) continue;
            if (child.querySelector('[data-stmui-sec]')) sweep(child);
            else mark(child, 'other');
        }
    };
    sweep(content);
    return setnav.marked.some(element => element.dataset.stmuiSec === 'look');
}

function buildSettingsHome(block) {
    const sections = SETTINGS_SECTIONS.filter(section => setnav.marked.some(element => element.dataset.stmuiSec === section.id));
    const row = (iconName, title, note, onclick) => h('button', { type: 'button', class: 'stmui-menu-row', onclick }, [
        ui(iconName, 'stmui-menu-row-icon'),
        h('span', { class: 'stmui-row-text' }, [h('span', { text: title }), h('small', { text: note })]),
        ui('chevron-right', 'stmui-menu-row-go'),
    ]);
    setnav.home = h('div', { class: 'stmui-set-home', 'data-stmui': '1' }, [
        h('button', { type: 'button', class: 'stmui-search-field', onclick: () => openSettingSearch() }, [ui('search'), h('span', { text: 'Search settings' })]),
        h('div', { class: 'stmui-menu-list' }, sections.map(section => row(section.icon, section.title, section.note, () => openSettingsSection(section.id)))),
        h('div', { class: 'stmui-menu-list' }, [row('phone', 'Pocket Tavern', 'Phone layout, gestures and helpers', () => openMobileSettings())]),
    ]);
    // The block on top holds the title, language, account and version; the list goes first in it.
    const top = block.querySelector('#settingsSearch')?.closest('#user-settings-block > *');
    if (top) top.prepend(setnav.home);
    else block.prepend(setnav.home);
}

function applySettingsView() {
    const block = settingsBlock();
    if (!block || !setnav.home) return;
    block.dataset.stmuiView = setnav.view;
    for (const element of setnav.marked) element.classList.toggle('stmui-sec-off', element.dataset.stmuiSec !== setnav.view);
}

function openSettingsSection(id) {
    if (!setnav.home) return;
    setnav.view = id;
    applySettingsView();
    const block = settingsBlock();
    if (block) block.scrollTop = 0;
    shell?.render(currentPageId());
    scheduleHistorySync();
}

function settingsSectionOpen() {
    return !!setnav.home && setnav.view !== 'home' && currentPageId() === 'user-settings-button';
}

/** Back from a section to the list of sections. */
function closeSettingsSection() {
    if (!settingsSectionOpen()) return false;
    setnav.view = 'home';
    applySettingsView();
    const block = settingsBlock();
    if (block) block.scrollTop = 0;
    shell?.render(currentPageId());
    scheduleHistorySync();
    return true;
}

function teardownSettingsNav() {
    for (const element of setnav.marked) {
        delete element.dataset.stmuiSec;
        element.classList.remove('stmui-sec-off');
    }
    setnav.marked = [];
    setnav.home?.remove();
    setnav.home = null;
    setnav.view = 'home';
    const block = settingsBlock();
    if (block) delete block.dataset.stmuiView;
    document.documentElement.classList.remove('stmui-setnav');
}

function syncSettingsNav() {
    const block = settingsBlock();
    if (!active || !settings.touchSizing || !block) {
        if (setnav.home || setnav.marked.length) teardownSettingsNav();
        return;
    }
    if (setnav.home?.isConnected) return;
    teardownSettingsNav();
    if (!markSettingsSections(block)) {
        teardownSettingsNav();
        return;
    }
    buildSettingsHome(block);
    document.documentElement.classList.add('stmui-setnav');
    applySettingsView();
}

/**
 * SillyTavern explains most settings in tooltips, which a phone never shows.
 * Show each one as a line under its setting, and lay toggles out as rows:
 * the label on the left, the switch on the right.
 */
function describeSettings(root) {
    if (!active || !settings.touchSizing || !root) return;
    const plain = text => String(text ?? '').replace(/\s+/g, ' ').trim();
    const useful = (tip, label) => {
        const a = plain(tip).toLowerCase();
        const b = plain(label).toLowerCase().replace(/[:：]$/, '');
        return a.length >= 6 && a !== b && !b.includes(a);
    };
    const help = text => h('small', { class: 'stmui-help stmui-skip', 'data-stmui': '1', text: plain(text) });
    const skip = '.template_element, #stmui-sheet, .world_entry, .inline-drawer-header';
    for (const label of root.querySelectorAll('label.checkbox_label')) {
        if (label.dataset.stmuiRow || label.closest(skip)) continue;
        if (!label.querySelector(':scope > input[type="checkbox"]') || label.querySelectorAll('input, select, textarea').length !== 1) continue;
        // Icon-only toggles (Formatting's "Bind to context" and the like) keep their look.
        if (!plain(label.textContent)) continue;
        label.dataset.stmuiRow = '1';
        label.classList.add('stmui-setrow');
        if (label.classList.contains('stmui-check')) continue;
        const icon = label.querySelector('.fa-circle-info[title]');
        const tip = label.getAttribute('title') || icon?.getAttribute('title') || '';
        if (!useful(tip, label.textContent)) continue;
        label.append(help(tip));
        icon?.classList.add('stmui-tip-shown');
    }
    // "Avatars: [Circle]" and similar rows on the Settings page.
    for (const select of root.querySelectorAll('#user-settings-block-content .flex-container > select, #UI-language-block > select')) {
        const row = select.parentElement;
        if (row.dataset.stmuiRow || !row.querySelector(':scope > span, :scope > label')) continue;
        row.dataset.stmuiRow = '1';
        row.classList.add('stmui-selrow');
        const tip = row.getAttribute('title') || '';
        if (useful(tip, row.querySelector(':scope > span, :scope > label')?.textContent)) row.append(help(tip));
    }
    // Sliders and other settings keep their explanation in an ⓘ icon.
    for (const icon of root.querySelectorAll('.fa-circle-info[title]')) {
        if (icon.classList.contains('stmui-tip-shown') || icon.closest(`${skip}, label.checkbox_label, .stmui-set-home`)) continue;
        const holder = icon.parentElement;
        if (!holder || holder === root) continue;
        const tip = icon.getAttribute('title');
        if (!useful(tip, holder.textContent)) continue;
        holder.after(help(tip));
        icon.classList.add('stmui-tip-shown');
    }
}

function removeSettingDescriptions() {
    document.querySelectorAll('.stmui-help, .stmui-ext-note').forEach(node => node.remove());
    document.querySelectorAll('[data-stmui-row]').forEach(node => {
        delete node.dataset.stmuiRow;
        node.classList.remove('stmui-setrow', 'stmui-selrow');
    });
    document.querySelectorAll('.stmui-tip-shown').forEach(node => node.classList.remove('stmui-tip-shown'));
}

/** One line on what each built-in extension does, under its name on the Extensions page. */
const EXTENSION_NOTES = {
    assets_container: 'More extensions, themes and sample characters',
    expressions_container: "Shows the character's emotion pictures",
    sd_container: 'Makes pictures with an image AI',
    tts_container: 'Reads replies aloud',
    qr_container: 'Buttons that send saved messages or commands',
    translation_container: 'Translates messages with an online translator',
    caption_container: 'Describes pictures you send',
    summarize_container: 'Keeps a running summary of long chats',
    regex_container: 'Find-and-replace rules for messages and prompts',
    vectors_container: 'Lets the AI recall older messages and files',
    stmui_settings: 'The phone layout you are using now',
};

function describeExtensions() {
    if (!active || !settings.touchSizing) return;
    for (const [id, note] of Object.entries(EXTENSION_NOTES)) {
        const header = document.querySelector(`#${id} .inline-drawer-header`);
        if (!header || header.querySelector('.stmui-ext-note')) continue;
        header.append(h('small', { class: 'stmui-ext-note stmui-skip', 'data-stmui': '1', text: note }));
    }
}

// -- the ☰ and wand menus as sheets

/** SillyTavern's chat options menu, in groups, each item with a line on what it does. */
const CHAT_OPTIONS = [
    {
        title: 'Reply', chat: true, items: [
            { id: 'option_regenerate', icon: 'refresh', note: 'Write the last reply again' },
            { id: 'option_continue', icon: 'play', note: 'Make the last reply longer' },
            { id: 'option_impersonate', icon: 'mask', note: 'Let the AI write your next message' },
        ],
    },
    {
        title: 'This chat', chat: true, items: [
            { id: 'option_toggle_AN', icon: 'note', note: 'A note the AI reads at a set depth' },
            { id: 'option_toggle_CFG', icon: 'scale', note: 'Extra guidance for the next replies' },
            { id: 'option_toggle_logprobs', icon: 'chart', note: 'Which words the AI weighed for each reply' },
            { id: 'option_new_bookmark', icon: 'flag', note: 'A point in this chat you can come back to' },
            { id: 'option_back_to_main', icon: 'arrow-left', note: 'Leave this branch for the chat it came from' },
            { id: 'option_convert_to_group', icon: 'users', note: 'Turn this chat into a group chat' },
            { id: 'option_delete_mes', icon: 'trash', note: 'Pick messages to remove', danger: true },
        ],
    },
    {
        title: 'Chats', items: [
            { id: 'option_start_new_chat', icon: 'chat-plus', note: 'A fresh chat with the same character' },
            { id: 'option_select_chat', icon: 'history', note: 'Every saved chat with this character' },
            { id: 'option_close_chat', icon: 'x', note: 'Back to the start screen' },
        ],
    },
];

/** Shown, unlike SillyTavern's spare copies (it has two "Close chat" items, one always hidden). */
function menuItemShown(element, stop) {
    if (!element || !(element.textContent ?? '').trim()) return false;
    for (let node = element; node && node !== stop; node = node.parentElement) {
        if (node.classList?.contains('displayNone') || node.style?.display === 'none' || node.hidden) return false;
    }
    return true;
}

function actionRow(iconNode, label, note, onclick, danger = false) {
    return h('button', { type: 'button', class: `stmui-menu-row stmui-action-row${danger ? ' stmui-menu-row-danger' : ''}`, onclick }, [
        iconNode,
        h('span', { class: 'stmui-row-text' }, [h('span', { text: label }), note ? h('small', { text: note }) : null]),
    ]);
}

/** Runs a SillyTavern menu item after the sheet is gone, so whatever it opens lands on top. */
function pressMenuItem(element) {
    closeSheet(true);
    buzz(6);
    element.click();
}

function itemLabel(element) {
    return (element.querySelector(':scope > span')?.textContent ?? element.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** The item's own Font Awesome icon (Pocket Tavern restyles those), or a neutral one. */
function faIcon(element) {
    const source = element.querySelector('.extensionsMenuExtensionButton, i[class*="fa-"], div[class*="fa-"]');
    if (!source) return ui('puzzle', 'stmui-menu-row-icon');
    const copy = source.cloneNode(false);
    copy.removeAttribute('id');
    copy.removeAttribute('title');
    copy.classList.add('stmui-menu-row-icon', 'stmui-fa-icon');
    copy.setAttribute('aria-hidden', 'true');
    return copy;
}

async function openChatOptions() {
    const menu = document.getElementById('options');
    if (!menu) return;
    // SillyTavern decides which checkpoint items apply when its menu opens; do the same.
    try {
        (await import('/scripts/bookmarks.js')).showBookmarksButtons?.();
    } catch (error) {
        console.debug(LOG, 'Checkpoint items not refreshed', error);
    }
    const context = ctx();
    const inChat = !!(context.groupId || context.characterId !== undefined);
    showSheet(new MenuSheet({
        title: 'Chat options',
        subtitle: '',
        fill: body => {
            const known = new Set();
            for (const group of CHAT_OPTIONS) {
                const rows = [];
                for (const item of group.items) {
                    known.add(item.id);
                    if (group.chat && !inChat) continue;
                    const element = [...menu.querySelectorAll(`[id="${item.id}"]`)].find(node => menuItemShown(node, menu));
                    if (element) rows.push(actionRow(ui(item.icon, 'stmui-menu-row-icon'), itemLabel(element), item.note, () => pressMenuItem(element), item.danger));
                }
                if (rows.length) body.append(h('h4', { class: 'stmui-menu-heading', text: group.title }), h('div', { class: 'stmui-menu-list' }, rows));
            }
            // Items other extensions put in the menu.
            const extra = [...menu.querySelectorAll('.options-content > :not(hr)')]
                .filter(node => !known.has(node.id) && menuItemShown(node, menu))
                .map(node => actionRow(faIcon(node), itemLabel(node), '', () => pressMenuItem(node)));
            if (extra.length) body.append(h('h4', { class: 'stmui-menu-heading', text: 'From extensions' }), h('div', { class: 'stmui-menu-list' }, extra));
        },
    }));
}

const TOOL_NOTES = {
    manageAttachments: 'Files and web pages the AI can look things up in',
    attachFile: 'Send a file or picture with your next message',
    sd_gen: 'Make a picture of the scene or a character',
    send_picture: 'Let the AI describe a picture',
    show_gallery_wand_button: 'Pictures saved for this character',
    ttsExtensionMenuItem: 'Turn reading replies aloud on or off',
    ttsExtensionNarrateAll: 'Read the whole chat aloud',
    token_counter: 'Count the tokens in any text',
    translate_chat: 'Translate every message in this chat',
    translate_input_message: 'Translate the message you are typing',
    stmui_wand_lorebooks: 'Choose the lorebooks for all chats',
};

const PICTURE_NOTES = {
    sd_you: 'The character',
    sd_face: "The character's face",
    sd_me: 'You, as your persona',
    sd_world: 'A scene from the whole story',
    sd_last: 'What the last message describes',
    sd_raw_last: 'The last message, word for word',
    sd_background: 'A background for this chat',
};

function openToolsSheet() {
    const menu = document.getElementById('extensionsMenu');
    if (!menu) return;
    showSheet(new MenuSheet({
        title: 'Tools',
        subtitle: 'From your extensions',
        fill: body => {
            const rows = [...menu.querySelectorAll('.list-group-item')]
                .filter(item => menuItemShown(item, menu))
                .map(item => actionRow(faIcon(item), itemLabel(item), TOOL_NOTES[item.id] ?? '', () => {
                    // Image generation asks what to draw, in a little menu of its own.
                    if (item.id === 'sd_gen' && document.querySelector('#sd_dropdown [id]')) openPictureSheet();
                    else pressMenuItem(item);
                }));
            body.append(rows.length ? h('div', { class: 'stmui-menu-list' }, rows) : h('p', { class: 'stmui-menu-foot', text: 'No extension has added a tool yet.' }));
        },
    }));
}

function openPictureSheet() {
    const dropdown = document.getElementById('sd_dropdown');
    showSheet(new MenuSheet({
        title: 'Generate image',
        subtitle: 'What should the picture show?',
        fill: body => {
            const rows = [...dropdown.querySelectorAll('[id]')]
                .filter(item => menuItemShown(item, dropdown))
                .map(item => actionRow(ui('image', 'stmui-menu-row-icon'), itemLabel(item), PICTURE_NOTES[item.id] ?? '', () => pressMenuItem(item)));
            body.append(h('div', { class: 'stmui-menu-list' }, rows));
        },
    }));
}

/** Taps on ☰ and the wand open the sheets instead of SillyTavern's small pop-up menus. */
function onMenuButtonClick(event) {
    if (!active || !settings.touchSizing) return;
    // A long explanation shows two lines; a tap shows all of it (and does not flip the switch it belongs to).
    const tip = event.target.closest?.('.stmui-help');
    if (tip) {
        event.preventDefault();
        event.stopPropagation();
        tip.classList.toggle('stmui-help-open');
        return;
    }
    const options = event.target.closest?.('#options_button');
    const wand = !options && event.target.closest?.('#extensionsMenuButton');
    if (!options && !wand) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    buzz(6);
    if (options) openChatOptions();
    else openToolsSheet();
}

// -- install as an app

const install = { prompt: null, originalManifest: undefined };

function isStandalone() {
    return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
}

/** Points Chrome at a manifest with a proper home-screen icon while Pocket Tavern is on. */
function syncManifest() {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) return;
    if (install.originalManifest === undefined) install.originalManifest = link.getAttribute('href');
    const ours = new URL('app.webmanifest', import.meta.url).href;
    const want = active ? ours : install.originalManifest;
    if (link.getAttribute('href') !== want) link.setAttribute('href', want);
    document.documentElement.classList.toggle('stmui-standalone', active && isStandalone());
}

async function installApp() {
    if (install.prompt) {
        const event = install.prompt;
        install.prompt = null;
        event.prompt();
        await event.userChoice.catch(() => null);
        return;
    }
    showSheet(new MenuSheet({
        title: t('Install as an app'),
        subtitle: t('Open SillyTavern from your home screen, full screen, without the browser bar.'),
        fill: body => body.append(h('div', { class: 'stmui-steps' }, [
            h('p', { text: t('1. Tap Chrome\'s ⋮ menu (top right).') }),
            h('p', { text: t('2. Tap "Add to Home screen" or "Install app".') }),
            h('p', { text: t('3. Tap Install. SillyTavern now has its own icon.') }),
            h('p', { class: 'stmui-menu-foot', text: t('Keep Termux running in the background as usual; the app opens the same SillyTavern.') }),
        ])),
    }));
}

// -- what's new

function compareVersions(a, b) {
    const pa = String(a).split('.').map(Number);
    const pb = String(b).split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        const diff = (pa[i] || 0) - (pb[i] || 0);
        if (diff) return diff;
    }
    return 0;
}

function openWhatsNew(since) {
    const entries = CHANGES.filter(entry => !since || compareVersions(entry.version, since) > 0);
    showSheet(new MenuSheet({
        title: t("What's new"),
        subtitle: t('Pocket Tavern {version}', { version: VERSION }),
        fill: body => {
            for (const entry of (entries.length ? entries : CHANGES.slice(0, 1))) {
                body.append(h('p', { class: 'stmui-menu-heading', text: entry.version }));
                body.append(h('ul', { class: 'stmui-news' }, entry.items.map(item => h('li', { text: t(item) }))));
            }
        },
    }));
}

/**
 * Automatic used to mean phones only. The first time Pocket Tavern turns on by
 * itself on a computer or tablet, say so once and offer the way back.
 */
function maybeShowDesktopNotice() {
    if (!active || settings.desktopNoticeSeen || readMode() !== 'auto' || detectPhone()) return false;
    settings.desktopNoticeSeen = true;
    settings.lastSeenVersion = VERSION;
    saveSettings();
    setTimeout(() => showSheet(new MenuSheet({
        title: 'Pocket Tavern is on here too',
        subtitle: 'It now switches on by itself on computers and tablets. Wide screens get the desktop layout.',
        fill: body => {
            body.append(h('div', { class: 'stmui-menu-list' }, [
                h('button', {
                    type: 'button',
                    class: 'stmui-menu-row',
                    onclick: () => closeSheet(),
                }, [ui('check', 'stmui-menu-row-icon'), h('span', { text: 'Keep it on' })]),
                h('button', {
                    type: 'button',
                    class: 'stmui-menu-row',
                    onclick: () => {
                        writeMode('phone');
                        closeSheet(true);
                        applyState();
                        syncSettingsMode();
                    },
                }, [ui('phone', 'stmui-menu-row-icon'), h('span', { text: 'Use it on phones only' })]),
            ]));
            body.append(h('p', { class: 'stmui-menu-foot', text: 'You can change this any time in Extensions → Pocket Tavern.' }));
        },
    })), 1200);
    return true;
}

function syncSettingsMode() {
    const select = document.getElementById('stmui_mode');
    if (select) select.value = readMode();
    updateStatusLine();
}

function maybeShowWhatsNew() {
    if (!active) return;
    const seen = settings.lastSeenVersion;
    settings.lastSeenVersion = VERSION;
    saveSettings();
    // Only after an update, never on a fresh install.
    if (seen && compareVersions(VERSION, seen) > 0) setTimeout(() => openWhatsNew(seen), 1200);
}

// -- language

function applyLanguage() {
    setLocale(ctx().getCurrentLocale?.() ?? navigator.language);
    const root = document.documentElement;
    root.classList.toggle('stmui-rtl', active && isRtl());
    if (active) {
        root.style.setProperty('--stmui-l-save', JSON.stringify(t('Save')));
        root.style.setProperty('--stmui-l-cancel', JSON.stringify(t('Cancel')));
    } else {
        root.style.removeProperty('--stmui-l-save');
        root.style.removeProperty('--stmui-l-cancel');
    }
}

function applyTextSize() {
    const root = document.documentElement;
    if (active && settings.textSize && settings.textSize !== 'normal') root.dataset.stmuiText = settings.textSize;
    else delete root.dataset.stmuiText;
}

function isCompact() {
    if (settings.uiSize === 'compact') return true;
    if (settings.uiSize !== 'auto') return false;
    const sides = [screen.width, screen.height].filter(n => n > 0);
    return sides.length > 0 && Math.min(...sides) < SMALL_PHONE_BELOW;
}

/** Size (compact or comfortable), the message box style and the tucked tabs. */
function applyLayoutPrefs() {
    const root = document.documentElement;
    root.classList.toggle('stmui-compact', active && isCompact());
    root.classList.toggle('stmui-docked', active && settings.chatStyle && settings.composerStyle === 'docked');
    shell?.syncTuck();
}

function syncExtras() {
    applyTextSize();
    applyChatLook();
    applyLayoutPrefs();
    syncComposer();
    // (Also takes the one-version marker off again when Pocket Tavern turns off.)
    syncSwipeCounters();
    foldLongMessages();
    syncLoreEntries();
    syncTriggerChips();
    renderMeter();
    if (active && settings.touchSizing) addSliderSteppers();
    else removeSliderSteppers();
    syncSettingsNav();
    if (!active || !settings.touchSizing) removeSettingDescriptions();
    if (!active) closeChatFinder();
    syncPictures();
    syncCharacterPage();
    syncWelcome();
    syncChatHistory();
    applyLanguage();
    syncEditorState();
    syncServerWatch();
    syncManifest();
    const fastOn = active && settings.fastChat;
    if (fastOn && !document.documentElement.classList.contains('stmui-fast-chat')) primeChatSizes();
    document.documentElement.classList.toggle('stmui-fast-chat', fastOn);
    if (fastOn) window.addEventListener('resize', onChatWidthChange);
    else {
        window.removeEventListener('resize', onChatWidthChange);
        window.clearTimeout(fastChat.timer);
        document.getElementById('chat')?.classList.remove('stmui-fast-prime');
    }
    syncJumpButton();
    syncPersonaTabs();
    syncPromptNameBox();
    if (!active || !settings.keepAwake) setAwake(false);
    if (!active || !settings.imageViewer) closeViewer(true);
    if (active) patchClipboard();
    if (extras.wired) return;
    extras.wired = true;
    // The prompt editor slides over the Presets page: keep its name box and the bar title current.
    const editor = promptEditor();
    if (editor) {
        // Its slide animation changes the style every frame; react a few times a second at most.
        let timer = 0;
        new MutationObserver(() => {
            if (timer || !active) return;
            timer = window.setTimeout(() => {
                timer = 0;
                syncPromptNameBox();
                syncTriggerChips();
                shell?.update();
            }, 60);
        }).observe(editor, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    // Capture phase: runs before SillyTavern's own delegated handlers.
    document.addEventListener('pointerdown', onSendPointerDown, true);
    document.body.addEventListener('mousedown', onChatMouseDown);
    document.addEventListener('keydown', onWideKeyDown);
    matchMedia(WIDE_QUERY).addEventListener?.('change', () => {
        setFeatureClasses();
        shell?.syncTuck();
        updateStatusLine();
        scheduleHistorySync();
    });
    document.addEventListener('click', onSendClick, true);
    document.addEventListener('click', onMenuButtonClick, true);
    document.addEventListener('click', onMessageMenuClick, true);
    document.addEventListener('click', onEditCopyClick, true);
    document.addEventListener('click', onAvatarClick, true);
    document.addEventListener('change', onAvatarPicked, true);
    document.addEventListener('touchstart', onSwipeStart, { passive: true });
    document.addEventListener('touchmove', onSwipeMove, { passive: true });
    document.addEventListener('touchend', onSwipeEnd);
    document.addEventListener('touchcancel', onSwipeEnd);
    window.addEventListener('swiped-left', onSwipedEvent, true);
    window.addEventListener('swiped-right', onSwipedEvent, true);
    document.addEventListener('touchstart', onToastTouchStart, { passive: true });
    document.addEventListener('touchmove', onToastTouchMove, { passive: true });
    document.addEventListener('touchend', onToastTouchEnd);
    document.addEventListener('touchcancel', onToastTouchEnd);
    document.addEventListener('input', onDraftInput, true);
    document.addEventListener('pointerdown', onFocusGuardPointer, true);
    document.addEventListener('focusin', onFocusGuardFocus, true);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('pointerdown', onMessagePressStart, true);
    document.addEventListener('pointermove', onMessagePressMove, true);
    for (const type of ['pointerup', 'pointercancel', 'scroll']) document.addEventListener(type, onMessagePressEnd, true);
    document.addEventListener('click', onPressAfterEffects, true);
    document.addEventListener('contextmenu', onPressAfterEffects, true);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') scheduleServerCheck(300);
    });
    window.addEventListener('online', () => scheduleServerCheck(300));
    window.addEventListener('offline', () => scheduleServerCheck(300));
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        install.prompt = event;
    });
    window.addEventListener('appinstalled', () => {
        install.prompt = null;
        globalThis.toastr?.success(t('SillyTavern is on your home screen now.'), t('Installed'));
    });
}

function textSizeControl() {
    return h('div', { class: 'stmui-segmented stmui-text-seg', role: 'group', 'aria-label': 'Chat text size' },
        Object.entries(TEXT_SIZES).map(([size, label]) => h('button', {
            type: 'button',
            class: `stmui-seg ${settings.textSize === size ? 'stmui-seg-on' : ''}`,
            'aria-pressed': String(settings.textSize === size),
            'aria-label': label,
            onclick: () => setAppearance('textSize', size),
        }, [h('span', { class: `stmui-aa stmui-aa-${size}`, text: 'Aa' })])));
}

function openExtrasSheet() {
    showSheet(new MenuSheet({
        title: 'Phone features',
        subtitle: 'Small helpers that make SillyTavern nicer on a phone.',
        fill: body => {
            body.append(h('p', { class: 'stmui-menu-heading', text: 'Chat text size' }));
            body.append(textSizeControl());
            body.append(h('p', { class: 'stmui-menu-heading', text: 'Helpers' }));
            body.append(h('div', { class: 'stmui-menu-list' }, EXTRAS.map(extra => switchRow(extra.key, extra.label, extra.hint))));
        },
    }));
}

// ------------------------------------------------------------ activation

function setFeatureClasses() {
    const root = document.documentElement;
    root.classList.toggle('stmui-on', active);
    root.classList.toggle('stmui-touch', active && settings.touchSizing);
    root.classList.toggle('stmui-shell', active && settings.appShell);
    root.classList.toggle('stmui-chat', active && settings.chatStyle);
    root.classList.toggle('stmui-wide', active && settings.appShell && matchMedia(WIDE_QUERY).matches);
}

const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * The page itself never scrolls in Pocket Tavern: the chat and pages scroll inside
 * it. If something scrolls it anyway (the browser bringing a text box into view),
 * the fixed bars and the message editor would slide off the screen, so put it back.
 * Not on iPhones: Safari scrolls the page on purpose to show the keyboard.
 */
function onStrayScroll() {
    if (!active || !settings.appShell || IS_IOS) return;
    if (window.scrollY || window.scrollX) window.scrollTo(0, 0);
}

/** On the desktop layout a page stays open beside the chat while you use the chat. */
function onChatMouseDown(event) {
    const root = document.documentElement;
    if (!root.classList.contains('stmui-wide') || !root.classList.contains('stmui-page-open')) return;
    // SillyTavern closes open panels on any mousedown that reaches <html>; stop it at <body>.
    // Back, the tab again, or Escape still close the page.
    if (!event.target.closest?.('.drawer-content')) event.stopPropagation();
}

/** Escape on the desktop layout: back one step (a settings section, then the page). */
function onWideKeyDown(event) {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (!document.documentElement.classList.contains('stmui-wide')) return;
    // Open sheets and SillyTavern's popups close themselves on Escape.
    if (sheet || viewer || document.querySelector('dialog[open]') || editorOpen() || openOverlays().length) return;
    if (closeSettingsSection() || (currentPageId() && (closePages(), true))) event.preventDefault();
}

function applyState() {
    const next = shouldBeActive();
    const changed = next !== active;
    active = next;
    setFeatureClasses();
    applyAppearance();
    watchRanges(active && settings.touchSizing);
    if (active) {
        startObserver();
        // Kept running while on: adding and removing its page-wide variables for every sheet restyled the whole page twice.
        if (!stopViewportFollow) stopViewportFollow = viewportFollow() ?? null;
    } else {
        stopObserver();
        closeSheet(true);
        stopViewportFollow?.();
        stopViewportFollow = null;
    }
    syncShell();
    const backGesture = active && settings.backGesture;
    watchOverlays(backGesture);
    if (!backGesture) resetHistoryTracking();
    else scheduleHistorySync();
    scan();
    syncWandShortcut();
    syncExtras();
    updateStatusLine();
    if (changed) console.info(LOG, active ? 'active' : 'inactive');
}

// ------------------------------------------------------------- settings UI

function updateStatusLine() {
    const line = document.getElementById('stmui_status');
    if (!line) return;
    const mode = readMode();
    let text;
    if (!settings.enabled) text = 'Off. The original interface is shown.';
    else if (mode === 'never') text = 'Turned off on this device. The original interface is shown.';
    else if (mode === 'phone') text = detectPhone() ? 'Phone detected. Pocket Tavern is on.' : 'Not a phone, so the original interface is shown.';
    else if (document.documentElement.classList.contains('stmui-wide')) text = 'On, with the desktop layout for this wide screen.';
    else text = 'On, with the phone layout.';
    line.textContent = text;
    line.classList.toggle('stmui-status-active', active);
}

function buildSettings() {
    if (document.getElementById('stmui_settings')) return;
    const container = document.getElementById('extensions_settings2') ?? document.getElementById('extensions_settings');
    if (!container) return;

    const check = (id, label, hint) => h('label', { class: 'checkbox_label stmui-check', for: id }, [
        h('input', { type: 'checkbox', id }),
        h('span', { class: 'stmui-check-text' }, [
            h('span', { class: 'stmui-check-label', text: label }),
            hint ? h('small', { class: 'stmui-check-hint', text: hint }) : null,
        ]),
    ]);

    const modeSelect = h('select', { id: 'stmui_mode', class: 'text_pole' }, [
        h('option', { value: 'auto', text: 'Automatic: phones and computers' }),
        h('option', { value: 'phone', text: 'Phones only' }),
        h('option', { value: 'never', text: 'Off on this device' }),
    ]);

    const panel = h('div', { id: 'stmui_settings', class: 'stmui-settings extension_container' }, [
        h('div', { class: 'inline-drawer' }, [
            h('div', { class: 'inline-drawer-toggle inline-drawer-header' }, [
                h('b', { text: 'Pocket Tavern' }),
                h('div', { class: 'inline-drawer-icon fa-solid fa-circle-chevron-down down' }),
            ]),
            h('div', { class: 'inline-drawer-content' }, [
                check('stmui_enabled', 'Enable Pocket Tavern', 'Off brings back the original interface.'),
                h('p', { id: 'stmui_status', class: 'stmui-status-line' }),
                h('label', { class: 'stmui-field', for: 'stmui_mode' }, [
                    h('span', { class: 'stmui-field-label', text: 'Use it on this device' }),
                    modeSelect,
                ]),
                h('small', { class: 'stmui-note', text: 'Phones get the phone layout and wide screens the desktop layout, on their own. Pick "Phones only" to keep the original interface on this computer.' }),
                h('hr'),
                h('label', { class: 'stmui-field', for: 'stmui_theme' }, [
                    h('span', { class: 'stmui-field-label', text: 'Theme' }),
                    h('select', { id: 'stmui_theme', class: 'text_pole' }, [
                        h('option', { value: 'st', text: 'Your SillyTavern theme' }),
                        ...THEMES.map(theme => h('option', { value: theme.id, text: `${theme.name}: ${theme.note}` })),
                    ]),
                ]),
                h('label', { class: 'stmui-field', for: 'stmui_motion' }, [
                    h('span', { class: 'stmui-field-label', text: 'Animations' }),
                    h('select', { id: 'stmui_motion', class: 'text_pole' }, Object.entries(MOTION_LABELS).map(([value, text]) => h('option', { value, text }))),
                ]),
                check('stmui_backdrop', 'Theme background', "Use the theme's backdrop instead of your chat background."),
                check('stmui_font', 'Modern font', "Your phone's own system font."),
                check('stmui_icons', 'New icons', 'Rounded line icons everywhere.'),
                h('label', { class: 'stmui-field', for: 'stmui_size' }, [
                    h('span', { class: 'stmui-field-label', text: 'Size' }),
                    h('select', { id: 'stmui_size', class: 'text_pole' }, Object.entries(SIZES).map(([value, text]) => h('option', { value, text }))),
                ]),
                h('label', { class: 'stmui-field', for: 'stmui_composer' }, [
                    h('span', { class: 'stmui-field-label', text: 'Message box' }),
                    h('select', { id: 'stmui_composer', class: 'text_pole' }, Object.entries(COMPOSER_STYLES).map(([value, text]) => h('option', { value, text }))),
                ]),
                h('label', { class: 'stmui-field', for: 'stmui_textsize' }, [
                    h('span', { class: 'stmui-field-label', text: 'Chat text size' }),
                    h('select', { id: 'stmui_textsize', class: 'text_pole' }, Object.entries(TEXT_SIZES).map(([value, text]) => h('option', { value, text }))),
                ]),
                h('hr'),
                ...EXTRAS.map(extra => check(extra.id, extra.label, extra.hint)),
                h('hr'),
                check('stmui_shell', 'App navigation', 'Top bar with the current character, and tabs at the bottom.'),
                check('stmui_chat', 'Modern chat look', 'Message cards, bigger text and a rounded message box.'),
                check('stmui_touch', 'Touch-friendly panels', 'Bigger buttons and sliders, roomier settings, bottom-sheet menus.'),
                check('stmui_back', 'Back gesture closes panels', 'Android back closes the open page, popup or sheet first.'),
                check('stmui_lorebook', 'Easy lorebook picker', 'Searchable list for global, character, chat and persona lorebooks.'),
                check('stmui_wand', 'Lorebooks shortcut in the ✨ menu', ''),
                check('stmui_long', 'Searchable long dropdowns (experimental)', 'Use the same list for any dropdown with 14 or more choices.'),
                h('small', { class: 'stmui-note', text: 'Changes apply right away. Nothing here changes your characters, chats or lorebooks.' }),
            ]),
        ]),
    ]);
    container.append(panel);

    const bind = (id, key, appearance = false) => {
        const input = document.getElementById(id);
        input.checked = !!settings[key];
        input.addEventListener('change', () => {
            if (appearance) {
                setAppearance(key, input.checked);
                return;
            }
            settings[key] = input.checked;
            saveSettings();
            applyState();
        });
    };
    bind('stmui_enabled', 'enabled');
    bind('stmui_shell', 'appShell');
    bind('stmui_chat', 'chatStyle');
    bind('stmui_touch', 'touchSizing');
    bind('stmui_back', 'backGesture');
    bind('stmui_lorebook', 'lorebookPicker');
    bind('stmui_wand', 'wandShortcut');
    bind('stmui_long', 'longSelects');
    bind('stmui_backdrop', 'themeBackdrop', true);
    bind('stmui_font', 'modernFont', true);
    bind('stmui_icons', 'customIcons', true);
    for (const extra of EXTRAS) bind(extra.id, extra.key, true);
    for (const [id, key] of [['stmui_theme', 'theme'], ['stmui_motion', 'motion'], ['stmui_textsize', 'textSize'], ['stmui_size', 'uiSize'], ['stmui_composer', 'composerStyle']]) {
        const select = document.getElementById(id);
        select.value = settings[key];
        select.addEventListener('change', () => setAppearance(key, select.value));
    }

    modeSelect.value = readMode();
    modeSelect.addEventListener('change', () => {
        writeMode(modeSelect.value);
        applyState();
    });
    updateStatusLine();
}

/** Keeps the Extensions-panel controls in step when settings change from a sheet. */
function syncSettingsInputs() {
    const pairs = { stmui_backdrop: 'themeBackdrop', stmui_font: 'modernFont', stmui_icons: 'customIcons' };
    for (const extra of EXTRAS) pairs[extra.id] = extra.key;
    for (const [id, key] of Object.entries(pairs)) {
        const input = document.getElementById(id);
        if (input) input.checked = !!settings[key];
    }
    for (const [id, key] of [['stmui_theme', 'theme'], ['stmui_motion', 'motion'], ['stmui_textsize', 'textSize'], ['stmui_size', 'uiSize'], ['stmui_composer', 'composerStyle']]) {
        const select = document.getElementById(id);
        if (select) select.value = settings[key];
    }
}

// ------------------------------------------------------------------- init

function init() {
    if (!globalThis.SillyTavern?.getContext || !globalThis.jQuery) {
        console.warn(LOG, 'SillyTavern context is not available; extension not started.');
        return;
    }
    loadSettings();
    // Pick the language before anything is drawn.
    setLocale(ctx().getCurrentLocale?.() ?? navigator.language);
    buildSettings();
    applyState();

    let resizeTimer = 0;
    const reevaluate = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(applyState, 150);
    };
    window.addEventListener('resize', reevaluate);
    window.addEventListener('orientationchange', reevaluate);
    window.addEventListener('popstate', onPopState);
    window.addEventListener('scroll', onStrayScroll, { passive: true });
    document.addEventListener('focusin', () => shell?.checkKeyboard());
    document.addEventListener('focusout', () => setTimeout(() => shell?.checkKeyboard(), 50));

    const { eventSource, event_types } = ctx();
    const refreshShell = () => shell?.update();
    eventSource?.on?.(event_types.APP_READY, () => {
        buildSettings();
        applyState();
        // SillyTavern puts back the last message box text on load; sort it into the right chat.
        restoreDraft();
        applyLanguage();
        if (!maybeShowDesktopNotice()) maybeShowWhatsNew();
    });
    for (const name of ['CHARACTER_EDITED', 'CHARACTER_PAGE_LOADED']) {
        if (event_types[name]) eventSource?.on?.(event_types[name], () => applyPendingAnimated());
    }
    eventSource?.on?.(event_types.CHAT_CHANGED, () => {
        applyPendingAnimated();
        sheet?.refresh();
        shell?.onChatChanged();
        guardKeyboard();
        restoreDraft();
        // A new chat starts at the bottom; hide the jump button until you scroll up.
        setTimeout(onChatScroll, 300);
        // After the messages (and folding, 200 ms) are in.
        primeChatSizes(400);
        holdAtNewest();
    });
    if (event_types.MORE_MESSAGES_LOADED) eventSource?.on?.(event_types.MORE_MESSAGES_LOADED, () => primeChatSizes(400));
    if (event_types.MESSAGE_SENT) eventSource?.on?.(event_types.MESSAGE_SENT, clearDraft);
    // Folded messages follow whatever changes in the chat.
    let chatTimer = 0;
    const chatChanged = () => {
        syncSwipeCounters();
        window.clearTimeout(chatTimer);
        chatTimer = window.setTimeout(foldLongMessages, 200);
    };
    for (const name of ['MESSAGE_RECEIVED', 'MESSAGE_DELETED', 'MESSAGE_SWIPED', 'MESSAGE_EDITED', 'CHARACTER_MESSAGE_RENDERED', 'USER_MESSAGE_RENDERED', 'MORE_MESSAGES_LOADED', 'GENERATION_STARTED', 'GENERATION_ENDED', 'GENERATION_STOPPED', 'CHAT_CHANGED']) {
        if (event_types[name]) eventSource?.on?.(event_types[name], chatChanged);
    }
    for (const name of ['CHAT_COMPLETION_PROMPT_READY', 'GENERATE_AFTER_COMBINE_PROMPTS']) {
        if (event_types[name]) eventSource?.on?.(event_types[name], onPromptReady);
    }
    if (event_types.CHAT_CHANGED) {
        eventSource?.on?.(event_types.CHAT_CHANGED, () => {
            meter.used = 0;
            meter.breakdown = null;
            renderMeter();
            closeChatFinder();
            // SillyTavern loads the chat's prompt records a moment after the chat.
            setTimeout(loadMeterFromHistory, 900);
            updatePersonaButton();
        });
    }
    // The persona button follows persona changes, renames and new pictures.
    for (const name of ['PERSONA_CHANGED', 'PERSONA_RENAMED', 'PERSONA_UPDATED', 'SETTINGS_UPDATED']) {
        if (event_types[name]) eventSource?.on?.(event_types[name], () => setTimeout(updatePersonaButton, 50));
    }
    // A new reply has its own record; the ring's details follow it.
    if (event_types.GENERATION_ENDED) {
        eventSource?.on?.(event_types.GENERATION_ENDED, () => {
            meter.breakdown = null;
        });
    }
    // Keep new, edited and swiped messages in the chat's translated language.
    for (const name of ['CHARACTER_MESSAGE_RENDERED', 'USER_MESSAGE_RENDERED']) {
        if (event_types[name]) eventSource?.on?.(event_types[name], id => queueAutoTranslate(id));
    }
    for (const name of ['MESSAGE_EDITED', 'MESSAGE_SWIPED']) {
        if (event_types[name]) {
            eventSource?.on?.(event_types[name], id => {
                dropTranslation(id);
                queueAutoTranslate(id);
            });
        }
    }
    if (event_types.GENERATION_STARTED) eventSource?.on?.(event_types.GENERATION_STARTED, (type, options, dryRun) => {
        // Dry runs (prompt token counts) start but never end; they aren't replies.
        if (!dryRun) onGenerating(true);
    });
    for (const name of ['GENERATION_ENDED', 'GENERATION_STOPPED']) {
        if (event_types[name]) eventSource?.on?.(event_types[name], () => onGenerating(false));
    }
    for (const name of ['ONLINE_STATUS_CHANGED', 'CHARACTER_EDITED', 'CHARACTER_RENAMED', 'GROUP_UPDATED', 'SETTINGS_UPDATED']) {
        if (event_types[name]) eventSource?.on?.(event_types[name], refreshShell);
    }
    document.addEventListener('click', onWandTranslateClick, true);
    // The wand menu can be (re)built after extensions load.
    setTimeout(syncWandShortcut, 1500);
    setTimeout(syncWandShortcut, 5000);
}

init();
