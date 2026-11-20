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
export const ST_THEME_COLORS = [
    'main_text_color', 'italics_text_color', 'underline_text_color', 'quote_text_color',
    'blur_tint_color', 'chat_tint_color', 'user_mes_blur_tint_color', 'bot_mes_blur_tint_color',
    'shadow_color', 'shadow_width', 'blur_strength',
];

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

/** How far apart two colors are (0–441). */
const distance = (a, b) => Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * A Pocket Tavern theme from a SillyTavern UI theme. With no chat background it
 * is solid: its text, narration, dialogue and panel colors on Pocket Tavern's
 * recipe (raised cards, quiet message tints, checked contrast). Over a chat
 * background it keeps SillyTavern's own look (see `glass`): how see-through its
 * panels are, its message tints, its blur strength and its text shadow, with
 * floors so text stays readable. The most colorful of its text colors becomes
 * the accent.
 * @param {Record<string, any>} st A SillyTavern theme (its saved JSON).
 * @returns {Theme|null}
 */
export function themeFromSillyTavern(st) {
    if (!st?.name) return null;
    const text0 = parseColor(st.main_text_color) ?? { r: 220, g: 220, b: 210, a: 1 };
    const dark = luminance(text0) > 0.3;
    const base = dark ? { r: 12, g: 12, b: 14, a: 1 } : { r: 250, g: 250, b: 248, a: 1 };
    const panel = parseColor(st.blur_tint_color) ?? base;
    let bg = over(panel, base);
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
    // Message cards in the theme's own tints (Azure: navy for the character, blue for you),
    // kept dark (or light) enough that the text reads on them.
    const cardFrom = tint => {
        if (!tint) return bg;
        let color = mixRgb(bg, { ...tint, a: 1 }, 0.6);
        for (let i = 0; i < 24 && contrast(text, color) < 7; i++) color = mixRgb(color, bg, 0.15);
        return color;
    };
    const botTint = parseColor(st.bot_mes_blur_tint_color);
    const userTint = parseColor(st.user_mes_blur_tint_color);
    const botCard = cardFrom(botTint);
    let userCard = cardFrom(userTint);
    if (distance(botCard, userCard) < 14) {
        userCard = mixRgb(botCard, accent, 0.16);
        for (let i = 0; i < 24 && contrast(text, userCard) < 7; i++) userCard = mixRgb(userCard, bg, 0.15);
    }
    const tintAlpha = Math.max(botTint?.a ?? 0, userTint?.a ?? 0);
    const shadow = parseColor(st.shadow_color);
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
        glass: {
            panel: clamp(panel.a, 0.55, 0.86),
            card: clamp(tintAlpha + 0.3, 0.55, 0.85),
            blur: clamp(Number(st.blur_strength) || 10, 4, 10),
            shadow: clamp(Number(st.shadow_width) || 0, 0, 3),
            shadowColor: shadow ? rgba(shadow, clamp(shadow.a, 0, 0.9)) : 'transparent',
            botCard: hex(botCard),
            userCard: hex(userCard),
        },
    };
}

/**
 * See-through values over a chat background. A SillyTavern theme brings its own;
 * Pocket Tavern's themes get frosted panels and cards in their surface color.
 */
function glassOf(t) {
    if (t.glass) return t.glass;
    const light = t.mode === 'light';
    return {
        panel: light ? 0.76 : 0.72,
        card: light ? 0.78 : 0.7,
        blur: 8,
        // A faint shadow under light text keeps it clear over a sharp picture.
        shadow: light ? 0 : 1,
        shadowColor: light ? 'transparent' : 'rgba(0, 0, 0, 0.55)',
        botCard: t.bg,
        userCard: `color-mix(in srgb, ${t.accent} 16%, ${t.bg})`,
    };
}

const see = (color, alpha) => `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;

/**
 * Text colors for glass: checked against a card as it looks over a mid-tone
 * picture (the card's color at its see-through amount over grey), and lifted
 * where they would fade. A faint narration color on a clear card was the usual
 * casualty. Returns only the colors that changed.
 */
function glassInk(t, g) {
    const card = parseColor(g.botCard) ?? parseColor(t.bg);
    if (!card) return {};
    const seen = over({ ...card, a: g.card }, { r: 128, g: 128, b: 128, a: 1 });
    const out = {};
    for (const [key, min] of [['text', 7], ['muted', 4.5], ['quote', 4.5]]) {
        const color = parseColor(t[key]);
        if (!color) continue;
        const fixed = readable(color, seen, min);
        if (hex(fixed) !== hex(color)) out[key] = hex(fixed);
    }
    return out;
}

/** The stylesheet for one theme. `scope` is the selector the overrides hang off. */
export function themeCss(theme, scope) {
    if (!theme) return '';
    const t = theme;
    const g = glassOf(t);
    const ink = glassInk(t, g);
    const inkCss = [
        ink.text ? `--SmartThemeBodyColor: ${ink.text} !important;` : '',
        ink.muted ? `--SmartThemeEmColor: ${ink.muted} !important;` : '',
        ink.quote ? `--SmartThemeQuoteColor: ${ink.quote} !important;` : '',
    ].filter(Boolean).join('\n    ');
    return `${scope} {
    color-scheme: ${t.mode};
    --SmartThemeBodyColor: ${t.text} !important;
    --SmartThemeEmColor: ${t.muted} !important;
    --SmartThemeUnderlineColor: ${t.accent} !important;
    --SmartThemeQuoteColor: ${t.quote} !important;
    --SmartThemeBlurTintColor: ${t.bg} !important;
    --SmartThemeChatTintColor: ${see(t.bg, 0.86)} !important;
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
    --stmui-opaque: ${t.bg};
    --stmui-raised: ${t.raised};
    --stmui-raised-2: color-mix(in srgb, ${t.text} 8%, ${t.raised});
    --stmui-line: ${t.border};
    --stmui-user-tint: ${t.user};
    --stmui-bot-tint: ${t.bot};
    --stmui-backdrop: ${t.backdrop};
}
/* Glass: your chat background shows. Panels, bars, sheets and the message box are
   frosted in the theme's surface color, the chat itself is clear, and each message
   is a frosted card. A SillyTavern theme keeps its own amounts, blur and text shadow. */
${scope}.stmui-glass {
    --SmartThemeBlurTintColor: ${see(t.bg, g.panel)} !important;
    --SmartThemeChatTintColor: transparent !important;
    --SmartThemeBotMesBlurTintColor: ${see(g.botCard, g.card)} !important;
    --SmartThemeUserMesBlurTintColor: ${see(g.userCard, g.card)} !important;
    --SmartThemeShadowColor: ${g.shadowColor} !important;
    --shadowWidth: ${g.shadow} !important;
    --stmui-surface: ${see(t.bg, g.panel)};
    --stmui-solid: ${see(t.bg, Math.min(g.panel + 0.08, 0.94))};
    --stmui-raised: ${see(t.raised, 0.6)};
    --stmui-raised-2: ${see(`color-mix(in srgb, ${t.text} 8%, ${t.raised})`, 0.7)};
    --stmui-bot-tint: ${see(g.botCard, g.card)};
    --stmui-user-tint: ${see(g.userCard, g.card)};
    --stmui-blur: ${g.blur}px;
    ${inkCss}
}
/* Looks without cards (Flat, SillyTavern's Document) keep a frosted chat to read on. */
${scope}.stmui-glass:is([data-stmui-look="flat"], :has(body:is(.documentstyle, .echostyle, .whisperstyle, .hushstyle, .ripplestyle, .tidestyle))) {
    --SmartThemeChatTintColor: ${see(t.bg, g.card)} !important;
}
`;
}
