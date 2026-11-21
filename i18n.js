/**
 * Translations for Pocket Tavern's own labels. The English text is the key, so a
 * missing translation simply shows English. SillyTavern's own interface is
 * translated by SillyTavern.
 */

/** @type {Record<string, Record<string, string>>} */
const DICTIONARIES = {};

let current = {};
let currentCode = 'en';
let rtl = false;

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/** Picks the dictionary for a locale like "es-es" or "zh-cn". */
export function setLocale(locale) {
    const code = String(locale || 'en').toLowerCase();
    const base = code.split(/[-_]/)[0];
    current = DICTIONARIES[code] ?? DICTIONARIES[base] ?? {};
    currentCode = DICTIONARIES[code] ? code : (DICTIONARIES[base] ? base : 'en');
    rtl = RTL_LANGUAGES.includes(base);
}

/** The language Pocket Tavern's own labels are shown in ("en" when there is no translation). */
export function currentLang() {
    return currentCode;
}

export function isRtl() {
    return rtl;
}

/** Translates `text`; `{name}` placeholders are filled from `values`. */
export function t(text, values) {
    let out = current[text] ?? text;
    if (values) out = out.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
    return out;
}

export function addDictionary(code, entries) {
    DICTIONARIES[code] = { ...(DICTIONARIES[code] ?? {}), ...entries };
}
