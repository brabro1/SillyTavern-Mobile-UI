/**
 * Translations for Mobile UI's own labels. The English text is the key, so a
 * missing translation simply shows English. SillyTavern's own interface is
 * translated by SillyTavern.
 */

/** @type {Record<string, Record<string, string>>} */
const DICTIONARIES = {};

let current = {};
let rtl = false;

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/** Picks the dictionary for a locale like "es-es" or "zh-cn". */
export function setLocale(locale) {
    const code = String(locale || 'en').toLowerCase();
    const base = code.split(/[-_]/)[0];
    current = DICTIONARIES[code] ?? DICTIONARIES[base] ?? {};
    rtl = RTL_LANGUAGES.includes(base);
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
