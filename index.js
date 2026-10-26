/**
 * Mobile UI for SillyTavern
 *
 * A phone-only touch interface layer. Everything is scoped behind the
 * `stmui-on` class on <html>; removing the class (or disabling the extension)
 * restores the stock interface.
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
    lorebookPicker: true,
    touchSizing: true,
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

// ------------------------------------------------------------------ sheet

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
        this.pushedHistory = false;
        this.build();
    }

    build() {
        const { picker } = this;
        this.dialog = h('dialog', { id: 'stmui-sheet', class: 'stmui-sheet', 'aria-label': picker.title });
        this.panel = h('div', { class: 'stmui-panel', tabindex: '-1' });
        if (picker.items().length > 6) this.panel.classList.add('stmui-panel-fixed');

        this.title = h('h3', { class: 'stmui-title', text: picker.title });
        this.subtitle = h('p', { class: 'stmui-subtitle', text: picker.config.subtitle ?? '' });
        const done = h('button', { type: 'button', class: 'stmui-done menu_button', onclick: () => closeSheet() }, [
            picker.multi ? 'Done' : 'Close',
        ]);
        this.head = h('div', { class: 'stmui-head' }, [
            h('div', { class: 'stmui-grab', 'aria-hidden': 'true' }),
            h('div', { class: 'stmui-head-row' }, [
                h('div', { class: 'stmui-head-text' }, [this.title, this.subtitle]),
                done,
            ]),
        ]);

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

        this.dialog.addEventListener('click', event => {
            if (event.target === this.dialog) closeSheet();
        });
        // SillyTavern closes unpinned drawers on any mousedown/touchstart outside them.
        // The sheet lives outside the drawer, so keep those events from reaching <html>.
        for (const type of ['mousedown', 'touchstart']) {
            this.dialog.addEventListener(type, event => event.stopPropagation(), { passive: true });
        }
        this.dialog.addEventListener('cancel', event => {
            event.preventDefault();
            closeSheet();
        });
        this.list.addEventListener('click', event => this.onListClick(event));
        this.wireSwipe();
        this.renderTools();
        this.renderList(true);
    }

    wireSwipe() {
        let startY = null;
        let dy = 0;
        const begin = event => {
            if (event.target.closest('button')) return;
            startY = event.touches[0].clientY;
            dy = 0;
            this.panel.style.transition = 'none';
        };
        const move = event => {
            if (startY === null) return;
            dy = Math.max(0, event.touches[0].clientY - startY);
            this.panel.style.transform = `translateY(${dy}px)`;
        };
        const end = () => {
            if (startY === null) return;
            startY = null;
            this.panel.style.transition = '';
            this.panel.style.transform = '';
            if (dy > 90) closeSheet();
        };
        this.head.addEventListener('touchstart', begin, { passive: true });
        this.head.addEventListener('touchmove', move, { passive: true });
        this.head.addEventListener('touchend', end);
        this.head.addEventListener('touchcancel', end);
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
        const drawer = document.querySelector('#WorldInfo');
        if (drawer && getComputedStyle(drawer).display === 'none') document.querySelector('#WIDrawerIcon')?.click();
        drawer?.scrollTo?.({ top: 0 });
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
            if (!total) message = picker.config.noun ? 'No options available.' : 'No lorebooks found yet. Create one from the World Info panel.';
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

function openSheet(picker, options = {}) {
    if (sheet) closeSheet(true);
    sheet = new Sheet(picker, options);
    document.body.append(sheet.dialog);
    sheet.dialog.showModal();
    stopViewportFollow = viewportFollow();
    requestAnimationFrame(() => sheet?.dialog.classList.add('stmui-sheet-open'));
    try {
        history.pushState({ stmuiSheet: true }, '');
        sheet.pushedHistory = true;
    } catch {
        // History is optional; the Android back gesture then just leaves the sheet open.
    }
    sheet.panel.focus({ preventScroll: true });
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
    if (current.pushedHistory && history.state?.stmuiSheet) {
        suppressPop += 1;
        history.back();
        // If no popstate arrives, do not leave the guard armed for a real back press.
        setTimeout(() => { suppressPop = Math.max(0, suppressPop - 1); }, 600);
    }
    if (immediate) {
        finish();
    } else {
        // Taps during the fade-out must not hit rows of a sheet that is already closing.
        current.dialog.style.pointerEvents = 'none';
        current.dialog.classList.remove('stmui-sheet-open');
        setTimeout(finish, 180);
    }
}

let suppressPop = 0;
function onPopState() {
    if (suppressPop > 0) {
        suppressPop -= 1;
        return;
    }
    if (sheet) {
        sheet.pushedHistory = false;
        closeSheet();
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
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (node.nodeType !== 1 || node.closest?.('#chat')) continue;
                if (node.matches?.(selector) || node.querySelector?.(selector)) {
                    scheduleScan();
                    return;
                }
            }
            if (settings.longSelects && record.target instanceof HTMLSelectElement && record.addedNodes.length && !pickers.has(record.target)) {
                scheduleScan();
                return;
            }
            if (record.removedNodes.length && pickers.size) {
                for (const select of pickers.keys()) {
                    if (!select.isConnected) {
                        scheduleScan();
                        return;
                    }
                }
            }
        }
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
    if (!settings.enabled) text = 'Disabled. The original interface is shown.';
    else if (mode === 'never') text = 'Turned off on this device. The original interface is shown.';
    else if (mode === 'always') text = 'Forced on for this device.';
    else text = detectPhone() ? 'Phone detected. Mobile UI is active.' : 'Not a phone. The original interface is shown.';
    line.textContent = text;
    line.classList.toggle('stmui-status-active', active);
}

function buildSettings() {
    if (document.getElementById('stmui_settings')) return;
    const container = document.getElementById('extensions_settings2') ?? document.getElementById('extensions_settings');
    if (!container) return;

    const check = (id, label, hint) => h('label', { class: 'checkbox_label', for: id, title: hint ?? '' }, [
        h('input', { type: 'checkbox', id }),
        h('span', { text: label }),
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
                check('stmui_enabled', 'Enable Mobile UI', 'Master switch. Off restores the original interface.'),
                h('p', { id: 'stmui_status', class: 'stmui-status-line' }),
                h('label', { class: 'stmui-field', for: 'stmui_mode' }, [
                    h('span', { class: 'stmui-field-label', text: 'Activation (this device only)' }),
                    modeSelect,
                ]),
                h('small', { class: 'stmui-note', text: 'Use "Always on" if your phone is not detected, for example when Chrome is set to Desktop site.' }),
                h('hr'),
                check('stmui_lorebook', 'Touch lorebook picker', 'Searchable bottom sheet for global, character, chat and persona lorebooks.'),
                check('stmui_wand', 'Lorebooks shortcut in the wand menu', 'Adds a Lorebooks entry to the send-bar wand menu.'),
                check('stmui_touch', 'Larger touch targets and safe-area spacing', 'Bigger buttons, 16px inputs, notch and keyboard aware spacing.'),
                check('stmui_long', 'Searchable sheet for long dropdowns (experimental)', 'Applies the sheet to any single-choice dropdown with 14+ options.'),
                h('small', { class: 'stmui-note', text: 'Changes apply immediately. Nothing here changes your lorebook data.' }),
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
    bind('stmui_lorebook', 'lorebookPicker');
    bind('stmui_wand', 'wandShortcut');
    bind('stmui_touch', 'touchSizing');
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

    // The wand menu can be (re)built after extensions load.
    const { eventSource, event_types } = ctx();
    eventSource?.on?.(event_types.APP_READY, () => {
        buildSettings();
        applyState();
    });
    eventSource?.on?.(event_types.CHAT_CHANGED, () => sheet?.refresh());
    setTimeout(syncWandShortcut, 1500);
    setTimeout(syncWandShortcut, 5000);
}

init();
