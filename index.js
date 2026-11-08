/**
 * Mobile UI for SillyTavern
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

const MODULE = 'mobileUI';
const MODE_KEY = 'stmui_mode';
const LOG = '[Mobile UI]';

const DEFAULTS = Object.freeze({
    enabled: true,
    appShell: true,
    chatStyle: true,
    touchSizing: true,
    backGesture: true,
    lorebookPicker: true,
    longSelects: false,
    wandShortcut: true,
});

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

/** SillyTavern's top-bar drawers, keyed by the id of their `.drawer` element. */
const PAGES = {
    'ai-config-button': { title: 'Presets', long: 'AI response settings', icon: 'fa-sliders' },
    'sys-settings-button': { title: 'API', long: 'API connection', icon: 'fa-plug' },
    'advanced-formatting-button': { title: 'Formatting', long: 'Prompt formatting', icon: 'fa-font' },
    'WI-SP-button': { title: 'Lorebooks', long: 'Lorebooks and World Info', icon: 'fa-book-atlas' },
    'user-settings-button': { title: 'Settings', long: 'User settings and theme', icon: 'fa-user-gear' },
    'backgrounds-button': { title: 'Backgrounds', long: 'Chat backgrounds', icon: 'fa-image' },
    'extensions-settings-button': { title: 'Extensions', long: 'Extensions and add-ons', icon: 'fa-cubes' },
    'persona-management-button': { title: 'Personas', long: 'Who you are in the chat', icon: 'fa-face-smile' },
    'rightNavHolder': { title: 'Characters', long: 'Characters and groups', icon: 'fa-address-book' },
};

const TABS = [
    { id: 'chat', label: 'Chat', icon: 'fa-comment-dots' },
    { id: 'rightNavHolder', label: 'Characters', icon: 'fa-address-book' },
    { id: 'WI-SP-button', label: 'Lorebooks', icon: 'fa-book-atlas' },
    { id: 'ai-config-button', label: 'Presets', icon: 'fa-sliders' },
    { id: 'more', label: 'More', icon: 'fa-grip' },
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
        else if (key === 'text') el.textContent = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
        else el.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children) {
        if (child === null || child === false || child === undefined) continue;
        el.append(child);
    }
    return el;
}

const icon = (classes) => h('i', { class: `fa-solid ${classes}`, 'aria-hidden': 'true' });

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
        return value === 'always' || value === 'never' ? value : 'auto';
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

function shouldBeActive() {
    if (!settings.enabled) return false;
    const mode = readMode();
    if (mode === 'never') return false;
    if (mode === 'always') return true;
    return detectPhone();
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

    let startY = null;
    let dy = 0;
    const begin = event => {
        if (event.target.closest('button')) return;
        startY = event.touches[0].clientY;
        dy = 0;
        panel.style.transition = 'none';
    };
    const move = event => {
        if (startY === null) return;
        dy = Math.max(0, event.touches[0].clientY - startY);
        panel.style.transform = `translateY(${dy}px)`;
    };
    const end = () => {
        if (startY === null) return;
        startY = null;
        panel.style.transition = '';
        panel.style.transform = '';
        if (dy > 90) closeSheet();
    };
    head.addEventListener('touchstart', begin, { passive: true });
    head.addEventListener('touchmove', move, { passive: true });
    head.addEventListener('touchend', end);
    head.addEventListener('touchcancel', end);
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
        this.body.replaceChildren();
        this.fill(this.body);
    }
}

function viewportFollow() {
    const vv = window.visualViewport;
    const root = document.documentElement;
    if (!vv) return;
    const apply = () => {
        root.style.setProperty('--stmui-vv-height', `${Math.round(vv.height)}px`);
        root.style.setProperty('--stmui-vv-top', `${Math.round(vv.offsetTop)}px`);
        sheet?.dialog.classList.toggle('stmui-compact', vv.height < COMPACT_BELOW);
    };
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
        vv.removeEventListener('resize', apply);
        vv.removeEventListener('scroll', apply);
        root.style.removeProperty('--stmui-vv-height');
        root.style.removeProperty('--stmui-vv-top');
    };
}

let stopViewportFollow = null;

function showSheet(instance) {
    if (sheet) closeSheet(true);
    sheet = instance;
    document.body.append(sheet.dialog);
    sheet.dialog.showModal();
    stopViewportFollow = viewportFollow();
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
    stopViewportFollow?.();
    stopViewportFollow = null;
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
        setTimeout(finish, 180);
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

/** Older SillyTavern overlays that are plain <div>s rather than <dialog>s. */
const OVERLAYS = [
    { selector: '#shadow_select_chat_popup', close: '#select_chat_cross' },
    { selector: '#character_popup', close: '#character_cross' },
];

function isShown(element) {
    return !!element && getComputedStyle(element).display !== 'none';
}

function openOverlays() {
    return OVERLAYS.filter(overlay => isShown(document.querySelector(overlay.selector)));
}

function openLayerCount() {
    let count = 0;
    if (currentPageId()) count += 1;
    count += openOverlays().length;
    count += document.querySelectorAll('dialog.popup[open]').length;
    if (sheet) count += 1;
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
    if (sheet) {
        closeSheet();
        return true;
    }
    const popups = document.querySelectorAll('dialog.popup[open]');
    if (popups.length) {
        popups[popups.length - 1].dispatchEvent(new Event('cancel', { cancelable: true }));
        return true;
    }
    const overlays = openOverlays();
    if (overlays.length) {
        $j()(overlays[0].close).trigger('click');
        return true;
    }
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
    for (const content of document.querySelectorAll('#top-settings-holder > .drawer > .drawer-content.openDrawer')) {
        content.parentElement.querySelector(':scope > .drawer-toggle')?.click();
    }
}

function showCharacterList() {
    document.getElementById('rm_button_characters')?.click();
}

// ------------------------------------------------------------ app shell

let shell = null;

class Shell {
    constructor() {
        this.drawerObserver = null;
        this.keyboardBase = { width: 0, height: 0 };
        this.onResize = () => this.checkKeyboard();
        this.build();
    }

    build() {
        // ---- top app bar
        this.back = h('button', { type: 'button', class: 'stmui-ab-btn stmui-ab-back', 'aria-label': 'Back to chat', onclick: () => closePages() }, [icon('fa-arrow-left')]);
        this.avatar = h('span', { class: 'stmui-ab-avatar', 'aria-hidden': 'true' });
        this.titleEl = h('span', { class: 'stmui-ab-title' });
        this.subEl = h('span', { class: 'stmui-ab-sub' });
        this.who = h('button', { type: 'button', class: 'stmui-ab-who', onclick: () => this.onWhoClick() }, [
            this.avatar,
            h('span', { class: 'stmui-ab-text' }, [this.titleEl, this.subEl]),
        ]);
        this.actions = h('div', { class: 'stmui-ab-actions' }, [
            h('button', {
                type: 'button',
                class: 'stmui-ab-btn stmui-ab-chats',
                'aria-label': 'Chat history',
                title: 'Chat history',
                onclick: () => document.getElementById('option_select_chat')?.click(),
            }, [icon('fa-clock-rotate-left')]),
            h('button', {
                type: 'button',
                class: 'stmui-ab-btn stmui-ab-new',
                'aria-label': 'Start a new chat',
                title: 'New chat',
                onclick: () => document.getElementById('option_start_new_chat')?.click(),
            }, [icon('fa-pen-to-square')]),
        ]);
        this.appbar = h('header', { id: 'stmui-appbar', class: 'stmui-appbar', 'data-stmui': '1' }, [this.back, this.who, this.actions]);

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
                h('span', { class: 'stmui-tab-icon' }, [icon(tab.icon)]),
                h('span', { class: 'stmui-tab-label', text: tab.label }),
            ]);
            this.tabs.set(tab.id, button);
            return button;
        });
        this.tabbar = h('nav', { id: 'stmui-tabbar', class: 'stmui-tabbar', 'aria-label': 'Main', 'data-stmui': '1' }, tabButtons);

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
        this.checkKeyboard();
        this.update();
    }

    destroy() {
        window.clearTimeout(this.settleTimer);
        document.getElementById('right-nav-panel')?.removeEventListener('click', this.onPanelClick);
        this.drawerObserver?.disconnect();
        window.removeEventListener('resize', this.onResize);
        this.appbar.remove();
        this.tabbar.remove();
        const root = document.documentElement;
        root.classList.remove('stmui-page-open', 'stmui-keyboard');
        delete root.dataset.stmuiPage;
    }

    /** Hides the tab bar while the on-screen keyboard is up (the layout shrinks with it). */
    checkKeyboard() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (Math.abs(width - this.keyboardBase.width) > 40) this.keyboardBase = { width, height };
        if (height > this.keyboardBase.height) this.keyboardBase.height = height;
        const typing = document.activeElement?.matches?.('textarea, input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), [contenteditable="true"]');
        const keyboard = height < this.keyboardBase.height * 0.78 && !!typing;
        document.documentElement.classList.toggle('stmui-keyboard', keyboard);
    }

    onTab(id) {
        if (id === 'more') {
            openMoreSheet();
            return;
        }
        if (sheet) closeSheet(true);
        if (id === 'chat') {
            closePages();
            return;
        }
        const open = currentPageId();
        if (open === id) {
            // Tapping the current tab goes "home" within it.
            if (id === 'rightNavHolder') showCharacterList();
            else document.querySelector(`#${id} > .drawer-content`)?.scrollTo?.({ top: 0, behavior: 'smooth' });
            return;
        }
        openPage(id);
        if (id === 'rightNavHolder') setTimeout(showCharacterList, 30);
    }

    /** Called when SillyTavern switches chats. */
    onChatChanged() {
        if (this.jumpAt && Date.now() - this.jumpAt < 4000 && currentPageId() === 'rightNavHolder') closePages();
        this.jumpAt = 0;
        this.update();
    }

    onWhoClick() {
        if (currentPageId()) return;
        const context = ctx();
        if (context.groupId || context.characterId !== undefined) openPage('rightNavHolder');
        else {
            openPage('rightNavHolder');
            setTimeout(showCharacterList, 30);
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
        const root = document.documentElement;
        root.classList.toggle('stmui-page-open', !!pageId);
        if (pageId) root.dataset.stmuiPage = pageId;
        else delete root.dataset.stmuiPage;

        const tabId = !pageId ? 'chat' : (this.tabs.has(pageId) ? pageId : 'more');
        for (const [id, button] of this.tabs) {
            const on = id === tabId;
            button.classList.toggle('stmui-tab-on', on);
            if (on) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        }

        if (pageId) {
            const drawer = drawerById(pageId);
            const info = drawer ? pageInfo(drawer) : { title: '', icon: 'fa-gear' };
            this.titleEl.textContent = info.title;
            this.subEl.textContent = info.long ?? '';
            if (pageId === 'rightNavHolder') {
                const editing = isShown(document.getElementById('rm_ch_create_block'));
                const name = document.getElementById('character_name_pole')?.value?.trim();
                if (editing) this.subEl.textContent = name ? `Editing ${name}` : 'New character';
                else if (isShown(document.getElementById('rm_group_chats_block'))) this.subEl.textContent = 'Group chat';
            }
            this.avatar.replaceChildren(icon(info.icon));
            this.avatar.classList.add('stmui-ab-avatar-icon');
            this.who.disabled = true;
            this.appbar.classList.add('stmui-ab-page');
            return;
        }

        this.appbar.classList.remove('stmui-ab-page');
        this.who.disabled = false;
        const context = ctx();
        let name = 'SillyTavern';
        let image = null;
        let hasChat = false;
        if (context.groupId) {
            const group = context.groups?.find(g => String(g.id) === String(context.groupId));
            name = group?.name ?? 'Group chat';
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
        this.subEl.textContent = connected ? String(status) : 'Not connected';
        this.subEl.classList.toggle('stmui-ab-offline', !connected);
        this.avatar.classList.remove('stmui-ab-avatar-icon');
        if (image) this.avatar.replaceChildren(h('img', { src: image, alt: '' }));
        else this.avatar.replaceChildren(icon(context.groupId ? 'fa-users' : (hasChat ? 'fa-user' : 'fa-comments')));
        this.actions.hidden = !hasChat;
    }
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
                let note = info.long ?? '';
                if (drawer.id === 'sys-settings-button') note = status && status !== 'no_connection' ? 'Connected' : 'Not connected';
                return h('button', {
                    type: 'button',
                    class: `stmui-tile ${openId === drawer.id ? 'stmui-tile-on' : ''} ${drawer.id === 'sys-settings-button' && note === 'Not connected' ? 'stmui-tile-warn' : ''}`,
                    onclick: () => {
                        closeSheet(true);
                        openPage(drawer.id);
                    },
                }, [
                    h('span', { class: 'stmui-tile-icon' }, [icon(info.icon)]),
                    h('span', { class: 'stmui-tile-label', text: info.title }),
                    note ? h('span', { class: 'stmui-tile-note', text: note }) : null,
                ]);
            });
            body.append(h('div', { class: 'stmui-tiles' }, tiles));

            const context = ctx();
            const inChat = !!(context.groupId || context.characterId !== undefined);
            const row = (iconName, label, onclick, disabled = false) => h('button', {
                type: 'button', class: 'stmui-menu-row', disabled, onclick,
            }, [icon(`${iconName} stmui-menu-row-icon`), h('span', { text: label }), icon('fa-chevron-right stmui-menu-row-go')]);
            body.append(h('div', { class: 'stmui-menu-list' }, [
                row('fa-clock-rotate-left', 'Chat history', () => {
                    closeSheet(true);
                    document.getElementById('option_select_chat')?.click();
                }, !inChat),
                row('fa-pen-to-square', 'Start a new chat', () => {
                    closeSheet(true);
                    document.getElementById('option_start_new_chat')?.click();
                }, !inChat),
                row('fa-mobile-screen', 'Mobile UI settings', () => {
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
        for (const record of records) {
            if (record.target === document.body) layers = true;
            if (rescan) continue;
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

// ------------------------------------------------------------ activation

function setFeatureClasses() {
    const root = document.documentElement;
    root.classList.toggle('stmui-on', active);
    root.classList.toggle('stmui-touch', active && settings.touchSizing);
    root.classList.toggle('stmui-shell', active && settings.appShell);
    root.classList.toggle('stmui-chat', active && settings.chatStyle);
}

function applyState() {
    const next = shouldBeActive();
    const changed = next !== active;
    active = next;
    setFeatureClasses();
    if (active) startObserver();
    else {
        stopObserver();
        closeSheet(true);
    }
    syncShell();
    const backGesture = active && settings.backGesture;
    watchOverlays(backGesture);
    if (!backGesture) resetHistoryTracking();
    else scheduleHistorySync();
    scan();
    syncWandShortcut();
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
    else if (mode === 'always') text = 'Always on for this device.';
    else text = detectPhone() ? 'Phone detected. Mobile UI is on.' : 'Not a phone, so the original interface is shown.';
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
        h('option', { value: 'auto', text: 'Automatic: phones only' }),
        h('option', { value: 'always', text: 'Always on (this device)' }),
        h('option', { value: 'never', text: 'Off (this device)' }),
    ]);

    const panel = h('div', { id: 'stmui_settings', class: 'stmui-settings extension_container' }, [
        h('div', { class: 'inline-drawer' }, [
            h('div', { class: 'inline-drawer-toggle inline-drawer-header' }, [
                h('b', { text: 'Mobile UI' }),
                h('div', { class: 'inline-drawer-icon fa-solid fa-circle-chevron-down down' }),
            ]),
            h('div', { class: 'inline-drawer-content' }, [
                check('stmui_enabled', 'Enable Mobile UI', 'Off brings back the original interface.'),
                h('p', { id: 'stmui_status', class: 'stmui-status-line' }),
                h('label', { class: 'stmui-field', for: 'stmui_mode' }, [
                    h('span', { class: 'stmui-field-label', text: 'Use it on this device' }),
                    modeSelect,
                ]),
                h('small', { class: 'stmui-note', text: 'Pick "Always on" if your phone is not detected.' }),
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

    const bind = (id, key) => {
        const input = document.getElementById(id);
        input.checked = !!settings[key];
        input.addEventListener('change', () => {
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

    modeSelect.value = readMode();
    modeSelect.addEventListener('change', () => {
        writeMode(modeSelect.value);
        applyState();
    });
    updateStatusLine();
}

// ------------------------------------------------------------------- init

function init() {
    if (!globalThis.SillyTavern?.getContext || !globalThis.jQuery) {
        console.warn(LOG, 'SillyTavern context is not available; extension not started.');
        return;
    }
    loadSettings();
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
    document.addEventListener('focusin', () => shell?.checkKeyboard());
    document.addEventListener('focusout', () => setTimeout(() => shell?.checkKeyboard(), 50));

    const { eventSource, event_types } = ctx();
    const refreshShell = () => shell?.update();
    eventSource?.on?.(event_types.APP_READY, () => {
        buildSettings();
        applyState();
    });
    eventSource?.on?.(event_types.CHAT_CHANGED, () => {
        sheet?.refresh();
        shell?.onChatChanged();
    });
    for (const name of ['ONLINE_STATUS_CHANGED', 'CHARACTER_EDITED', 'CHARACTER_RENAMED', 'GROUP_UPDATED', 'SETTINGS_UPDATED']) {
        if (event_types[name]) eventSource?.on?.(event_types[name], refreshShell);
    }
    // The wand menu can be (re)built after extensions load.
    setTimeout(syncWandShortcut, 1500);
    setTimeout(syncWandShortcut, 5000);
}

init();
