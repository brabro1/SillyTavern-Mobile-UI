/**
 * Pocket Tavern themes.
 *
 * A theme overrides SillyTavern's own --SmartTheme* colors (and our --stmui-*
 * tokens) with !important stylesheet rules, so the whole interface changes
 * while the user's saved SillyTavern theme stays untouched. Choosing "Your
 * SillyTavern theme" removes the overrides again.
 */

/**
 * @typedef {object} Theme
 * @property {string} id
 * @property {string} name
 * @property {string} note
 * @property {'dark'|'light'} mode
 * @property {string} bg        page / panel surface (opaque)
 * @property {string} raised    cards and fields
 * @property {string} text
 * @property {string} muted     narration (em) text
 * @property {string} accent    buttons, active tab, selection
 * @property {string} onAccent  text on accent
 * @property {string} quote     dialogue text in chat
 * @property {string} user      user message tint
 * @property {string} bot       character message tint
 * @property {string} border
 * @property {string} backdrop  CSS background behind the chat
 */

/** @type {Theme[]} */
export const THEMES = [
    // Each theme differs in structure, not only in hue: how light the surface is,
    // whether there is a glow (at most one) and where, and an accent tuned for it.
    {
        id: 'midnight', name: 'Midnight', note: 'Ink-blue night, violet glow', mode: 'dark',
        bg: '#0f1020', raised: '#1a1b33', text: '#e6e6f5', muted: '#a3a3c2', accent: '#8b7cf6', onAccent: '#14102e', quote: '#c4b5fd',
        user: 'rgba(139, 124, 246, 0.15)', bot: 'rgba(255, 255, 255, 0.045)', border: 'rgba(160, 160, 255, 0.14)',
        backdrop: 'radial-gradient(110% 55% at 80% 0%, #241d52 0%, transparent 60%), #0b0c18',
    },
    {
        id: 'amoled', name: 'AMOLED', note: 'True black, candle gold', mode: 'dark',
        bg: '#000000', raised: '#121212', text: '#ededed', muted: '#a0a0a0', accent: '#d9b36c', onAccent: '#241a05', quote: '#e8cf9e',
        user: 'rgba(217, 179, 108, 0.12)', bot: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.10)',
        backdrop: '#000000',
    },
    {
        id: 'mocha', name: 'Mocha', note: 'Soft pastels on dark', mode: 'dark',
        bg: '#1e1e2e', raised: '#2a2a3d', text: '#cdd6f4', muted: '#a6adc8', accent: '#cba6f7', onAccent: '#1e1e2e', quote: '#f5c2e7',
        user: 'rgba(203, 166, 247, 0.14)', bot: 'rgba(205, 214, 244, 0.05)', border: 'rgba(205, 214, 244, 0.12)',
        backdrop: '#181825',
    },
    {
        id: 'ocean', name: 'Ocean', note: 'Sea blue, light from above', mode: 'dark',
        bg: '#0e2331', raised: '#173649', text: '#e2f0f7', muted: '#9cbccc', accent: '#5fb3d9', onAccent: '#062033', quote: '#a3d4ea',
        user: 'rgba(95, 179, 217, 0.15)', bot: 'rgba(255, 255, 255, 0.05)', border: 'rgba(163, 212, 234, 0.13)',
        backdrop: 'radial-gradient(130% 60% at 50% 0%, #144a63 0%, transparent 65%), #08161f',
    },
    {
        id: 'forest', name: 'Forest', note: 'Moss and bark', mode: 'dark',
        bg: '#141b16', raised: '#1f2a22', text: '#e4ece5', muted: '#a3b5a7', accent: '#8fbf7a', onAccent: '#14240e', quote: '#c9dc9b',
        user: 'rgba(143, 191, 122, 0.13)', bot: 'rgba(255, 255, 255, 0.045)', border: 'rgba(200, 225, 190, 0.11)',
        backdrop: '#101612',
    },
    {
        id: 'sakura', name: 'Sakura', note: 'Dusk plum and dusty rose', mode: 'dark',
        bg: '#1d1419', raised: '#2c1f27', text: '#f6e7ee', muted: '#c9aab9', accent: '#e48fae', onAccent: '#3a0f22', quote: '#f2bcd0',
        user: 'rgba(228, 143, 174, 0.14)', bot: 'rgba(255, 255, 255, 0.045)', border: 'rgba(242, 188, 208, 0.13)',
        backdrop: '#170f14',
    },
    {
        id: 'ember', name: 'Ember', note: 'Hearth glow from below', mode: 'dark',
        bg: '#1a130e', raised: '#2a1f17', text: '#f5e9df', muted: '#c6ab96', accent: '#e8924a', onAccent: '#341604', quote: '#f2c08c',
        user: 'rgba(232, 146, 74, 0.14)', bot: 'rgba(255, 255, 255, 0.045)', border: 'rgba(242, 192, 140, 0.13)',
        backdrop: 'radial-gradient(130% 55% at 50% 100%, #4a220c 0%, transparent 65%), #120c08',
    },
    {
        id: 'nord', name: 'Nord', note: 'Cool arctic slate', mode: 'dark',
        bg: '#2e3440', raised: '#3b4252', text: '#eceff4', muted: '#b2bccc', accent: '#88c0d0', onAccent: '#1d2a30', quote: '#a3d1dc',
        user: 'rgba(136, 192, 208, 0.16)', bot: 'rgba(236, 239, 244, 0.05)', border: 'rgba(216, 222, 233, 0.12)',
        backdrop: '#2e3440',
    },
    {
        id: 'cyber', name: 'Neon', note: 'Night city, magenta glow', mode: 'dark',
        bg: '#0a0a14', raised: '#15152a', text: '#e8e8ff', muted: '#9d9dc6', accent: '#2ec4d6', onAccent: '#022529', quote: '#f0a6f5',
        user: 'rgba(46, 196, 214, 0.13)', bot: 'rgba(240, 166, 245, 0.06)', border: 'rgba(46, 196, 214, 0.18)',
        backdrop: 'radial-gradient(110% 55% at 100% 0%, #3a0b56 0%, transparent 60%), #06060d',
    },
    {
        id: 'paper', name: 'Paper', note: 'Ink on paper, easy reading', mode: 'light',
        bg: '#efefec', raised: '#fbfbf9', text: '#1f2226', muted: '#5b5f64', accent: '#1e4f8f', onAccent: '#ffffff', quote: '#264b7d',
        user: 'rgba(30, 79, 143, 0.07)', bot: 'rgba(31, 34, 38, 0.035)', border: 'rgba(31, 34, 38, 0.12)',
        backdrop: '#ebebe7',
    },
    {
        id: 'cloud', name: 'Cloud', note: 'Daylight sky, deep teal', mode: 'light',
        bg: '#f2f5f8', raised: '#ffffff', text: '#1b2430', muted: '#56637a', accent: '#0f6e8c', onAccent: '#ffffff', quote: '#0d5c75',
        user: 'rgba(15, 110, 140, 0.08)', bot: 'rgba(27, 36, 48, 0.035)', border: 'rgba(27, 36, 48, 0.11)',
        backdrop: 'radial-gradient(130% 55% at 50% 0%, #dcebf3 0%, transparent 65%), #f2f5f8',
    },
    {
        id: 'lavender', name: 'Lavender', note: 'Soft lilac and plum', mode: 'light',
        bg: '#f5f2f8', raised: '#ffffff', text: '#26222f', muted: '#625b70', accent: '#6a4a9e', onAccent: '#ffffff', quote: '#5b3e8c',
        user: 'rgba(106, 74, 158, 0.08)', bot: 'rgba(38, 34, 47, 0.035)', border: 'rgba(38, 34, 47, 0.11)',
        backdrop: '#f3f0f7',
    },
];

export function findTheme(id) {
    return THEMES.find(theme => theme.id === id) ?? null;
}

// -- SillyTavern's UI themes, made to fit Pocket Tavern

/** The colors of a SillyTavern theme that Pocket Tavern uses (what is saved with the choice). */
export const ST_THEME_COLORS = ['main_text_color', 'italics_text_color', 'underline_text_color', 'quote_text_color', 'blur_tint_color'];

const parseColor = value => {
    const text = String(value ?? '').trim();
    const rgb = text.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i);
    if (rgb) {
        const a = rgb[4] === undefined ? 1 : rgb[4].endsWith('%') ? parseFloat(rgb[4]) / 100 : Number(rgb[4]);
        return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a };
    }
    const hex = text.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
    if (hex) {
        const n = parseInt(hex[1], 16);
        return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: hex[2] ? parseInt(hex[2], 16) / 255 : 1 };
    }
    return null;
};
/** `top` laid over the solid color `base`. */
const over = (top, base) => ({ r: top.r * top.a + base.r * (1 - top.a), g: top.g * top.a + base.g * (1 - top.a), b: top.b * top.a + base.b * (1 - top.a), a: 1 });
/** `amount` (0–1) of `b` mixed into `a`. */
const mixRgb = (a, b, amount) => ({ r: a.r + (b.r - a.r) * amount, g: a.g + (b.g - a.g) * amount, b: a.b + (b.b - a.b) * amount, a: 1 });
const luminance = c => {
    const ch = v => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
};
const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};
const chroma = c => Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
const hex = c => `#${[c.r, c.g, c.b].map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
const rgba = (c, alpha) => `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${alpha})`;
const BLACK = { r: 0, g: 0, b: 0, a: 1 };
const WHITE = { r: 255, g: 255, b: 255, a: 1 };
/** Moves `fg` away from `bg` (toward white on dark, black on light) until it reaches `min` contrast. */
const readable = (fg, bg, min) => {
    const target = luminance(bg) < 0.4 ? WHITE : BLACK;
    let color = fg;
    for (let i = 0; i < 24 && contrast(color, bg) < min; i++) color = mixRgb(color, target, 0.08);
    return color;
};

/**
 * A Pocket Tavern theme from a SillyTavern UI theme: its text, narration, dialogue
 * and surface colors, with Pocket Tavern's own recipe for the rest (an opaque
 * surface, raised cards, quiet message tints, a soft glow, checked contrast).
 * The most colorful of its text colors becomes the accent.
 * @param {Record<string, any>} st A SillyTavern theme (its saved JSON).
 * @returns {Theme|null}
 */
export function themeFromSillyTavern(st) {
    if (!st?.name) return null;
    const text0 = parseColor(st.main_text_color) ?? { r: 220, g: 220, b: 210, a: 1 };
    const dark = luminance(text0) > 0.3;
    const base = dark ? { r: 12, g: 12, b: 14, a: 1 } : { r: 250, g: 250, b: 248, a: 1 };
    // SillyTavern's panels are see-through over your background; Pocket Tavern's are solid.
    let bg = over(parseColor(st.blur_tint_color) ?? base, base);
    for (let i = 0; i < 24 && contrast(over(text0, bg), bg) < 7; i++) bg = mixRgb(bg, base, 0.12);
    const text = readable(over(text0, bg), bg, 7);
    const pick = name => {
        const color = parseColor(st[name]);
        return color ? over(color, bg) : null;
    };
    const quote = readable(pick('quote_text_color') ?? text, bg, 4.5);
    const muted = readable(pick('italics_text_color') ?? mixRgb(text, bg, 0.35), bg, 4.5);
    const candidates = ['quote_text_color', 'underline_text_color', 'main_text_color', 'italics_text_color'].map(pick).filter(Boolean);
    const vivid = candidates.reduce((best, color) => (chroma(color) > chroma(best) ? color : best), candidates[0] ?? text);
    const accent = readable(vivid, bg, 3);
    const darkInk = mixRgb(accent, BLACK, 0.82);
    const onAccent = contrast(WHITE, accent) >= contrast(darkInk, accent) ? WHITE : darkInk;
    const glow = mixRgb(bg, accent, 0.16);
    const floor = mixRgb(bg, base, 0.35);
    return {
        id: `st:${st.name}`,
        name: st.name,
        note: 'From SillyTavern',
        mode: dark ? 'dark' : 'light',
        bg: hex(bg),
        // Cards are a step lighter than the page: toward the text on dark, toward white on light (like Paper and Cloud).
        raised: hex(dark ? mixRgb(bg, text, 0.07) : mixRgb(bg, WHITE, 0.7)),
        text: hex(text),
        muted: hex(muted),
        accent: hex(accent),
        onAccent: hex(onAccent),
        quote: hex(quote),
        user: rgba(accent, dark ? 0.14 : 0.08),
        bot: rgba(text, dark ? 0.045 : 0.035),
        border: rgba(text, dark ? 0.12 : 0.11),
        backdrop: `radial-gradient(120% 55% at 50% 0%, ${hex(glow)} 0%, transparent 65%), ${hex(floor)}`,
    };
}

/** The stylesheet for one theme. `scope` is the selector the overrides hang off. */
export function themeCss(theme, scope) {
    if (!theme) return '';
    const t = theme;
    const translucent = color => `color-mix(in srgb, ${color} 86%, transparent)`;
    const card = color => `color-mix(in srgb, ${color} 90%, transparent)`;
    const userCard = card(`color-mix(in srgb, ${t.accent} 14%, ${t.bg})`);
    return `${scope} {
    color-scheme: ${t.mode};
    --SmartThemeBodyColor: ${t.text} !important;
    --SmartThemeEmColor: ${t.muted} !important;
    --SmartThemeUnderlineColor: ${t.accent} !important;
    --SmartThemeQuoteColor: ${t.quote} !important;
    --SmartThemeBlurTintColor: ${t.bg} !important;
    --SmartThemeChatTintColor: ${translucent(t.bg)} !important;
    --SmartThemeUserMesBlurTintColor: ${t.user} !important;
    --SmartThemeBotMesBlurTintColor: ${t.bot} !important;
    --SmartThemeBorderColor: ${t.border} !important;
    --SmartThemeShadowColor: transparent !important;
    --SmartThemeFastUIBGColor: ${t.bg} !important;
    --shadowWidth: 0 !important;
    --stmui-accent: ${t.accent};
    --stmui-on-accent: ${t.onAccent};
    --stmui-surface: ${t.bg};
    --stmui-solid: ${t.bg};
    --stmui-raised: ${t.raised};
    --stmui-raised-2: color-mix(in srgb, ${t.text} 8%, ${t.raised});
    --stmui-line: ${t.border};
    --stmui-user-tint: ${t.user};
    --stmui-bot-tint: ${t.bot};
    --stmui-backdrop: ${t.backdrop};
}
/* Your own chat background instead of the theme's: the chat is see-through so the
   picture shows, and each message turns into a card solid enough to read on. */
${scope}:not(.stmui-backdrop) {
    --SmartThemeChatTintColor: transparent !important;
    --SmartThemeBotMesBlurTintColor: ${card(t.bg)} !important;
    --SmartThemeUserMesBlurTintColor: ${userCard} !important;
    --stmui-bot-tint: ${card(t.bg)};
    --stmui-user-tint: ${userCard};
}
/* Looks without cards (Flat, SillyTavern's Document) keep a tinted chat to read on. */
${scope}:not(.stmui-backdrop):is([data-stmui-look="flat"], :has(body:is(.documentstyle, .echostyle, .whisperstyle, .hushstyle, .ripplestyle, .tidestyle))) {
    --SmartThemeChatTintColor: ${translucent(t.bg)} !important;
}
`;
}
