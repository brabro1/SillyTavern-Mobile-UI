/**
 * Mobile UI themes.
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
    {
        id: 'midnight', name: 'Midnight', note: 'Deep blue, violet glow', mode: 'dark',
        bg: '#0f1020', raised: '#1a1b33', text: '#e6e6f5', muted: '#a3a3c2', accent: '#8b7cf6', onAccent: '#ffffff', quote: '#c4b5fd',
        user: 'rgba(139, 124, 246, 0.16)', bot: 'rgba(255, 255, 255, 0.045)', border: 'rgba(160, 160, 255, 0.14)',
        backdrop: 'radial-gradient(120% 70% at 85% 0%, #2a2160 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, #142046 0%, transparent 65%), #0b0c18',
    },
    {
        id: 'amoled', name: 'AMOLED', note: 'True black, saves battery', mode: 'dark',
        bg: '#000000', raised: '#121212', text: '#ededed', muted: '#9e9e9e', accent: '#2dd4bf', onAccent: '#00201c', quote: '#5eead4',
        user: 'rgba(45, 212, 191, 0.13)', bot: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.10)',
        backdrop: '#000000',
    },
    {
        id: 'mocha', name: 'Mocha', note: 'Soft pastel on dark', mode: 'dark',
        bg: '#1e1e2e', raised: '#2a2a3d', text: '#cdd6f4', muted: '#a6adc8', accent: '#cba6f7', onAccent: '#1e1e2e', quote: '#f5c2e7',
        user: 'rgba(203, 166, 247, 0.15)', bot: 'rgba(205, 214, 244, 0.05)', border: 'rgba(205, 214, 244, 0.12)',
        backdrop: 'radial-gradient(100% 60% at 100% 0%, #3b2f55 0%, transparent 60%), radial-gradient(80% 50% at 0% 100%, #2f2a44 0%, transparent 60%), #181825',
    },
    {
        id: 'ocean', name: 'Ocean', note: 'Calm deep-sea blues', mode: 'dark',
        bg: '#0b1a24', raised: '#132a38', text: '#e2f1f8', muted: '#94b8c9', accent: '#38bdf8', onAccent: '#032536', quote: '#7dd3fc',
        user: 'rgba(56, 189, 248, 0.15)', bot: 'rgba(255, 255, 255, 0.045)', border: 'rgba(125, 211, 252, 0.13)',
        backdrop: 'radial-gradient(120% 70% at 100% 0%, #0e4a66 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, #0b2f45 0%, transparent 65%), #071219',
    },
    {
        id: 'forest', name: 'Forest', note: 'Mossy greens', mode: 'dark',
        bg: '#0f1a14', raised: '#1a2a20', text: '#e3efe6', muted: '#9db8a5', accent: '#4ade80', onAccent: '#052e16', quote: '#bef264',
        user: 'rgba(74, 222, 128, 0.14)', bot: 'rgba(255, 255, 255, 0.045)', border: 'rgba(134, 239, 172, 0.12)',
        backdrop: 'radial-gradient(110% 70% at 90% 0%, #1d4a2c 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, #15331f 0%, transparent 65%), #0a120d',
    },
    {
        id: 'sakura', name: 'Sakura', note: 'Dusky rose and blossom', mode: 'dark',
        bg: '#1c1218', raised: '#2b1c25', text: '#f6e7ee', muted: '#c9a8b8', accent: '#f472b6', onAccent: '#3b0a24', quote: '#f9a8d4',
        user: 'rgba(244, 114, 182, 0.16)', bot: 'rgba(255, 255, 255, 0.045)', border: 'rgba(249, 168, 212, 0.14)',
        backdrop: 'radial-gradient(110% 70% at 100% 0%, #5a2142 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, #3a1730 0%, transparent 65%), #140c11',
    },
    {
        id: 'ember', name: 'Ember', note: 'Warm firelight', mode: 'dark',
        bg: '#1a120d', raised: '#2a1d15', text: '#f5e9df', muted: '#c4a893', accent: '#fb923c', onAccent: '#3a1503', quote: '#fdba74',
        user: 'rgba(251, 146, 60, 0.15)', bot: 'rgba(255, 255, 255, 0.045)', border: 'rgba(253, 186, 116, 0.13)',
        backdrop: 'radial-gradient(110% 70% at 100% 0%, #5c2a10 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, #3a1d0e 0%, transparent 65%), #120c08',
    },
    {
        id: 'nord', name: 'Nord', note: 'Cool arctic slate', mode: 'dark',
        bg: '#2e3440', raised: '#3b4252', text: '#eceff4', muted: '#b2bccc', accent: '#88c0d0', onAccent: '#1d2a30', quote: '#a3d1dc',
        user: 'rgba(136, 192, 208, 0.16)', bot: 'rgba(236, 239, 244, 0.05)', border: 'rgba(216, 222, 233, 0.12)',
        backdrop: 'linear-gradient(160deg, #3b4252 0%, #2e3440 55%, #272c36 100%)',
    },
    {
        id: 'cyber', name: 'Neon', note: 'Night-city neon', mode: 'dark',
        bg: '#0a0a14', raised: '#15152a', text: '#e8e8ff', muted: '#9a9ac4', accent: '#22d3ee', onAccent: '#02242a', quote: '#f0abfc',
        user: 'rgba(34, 211, 238, 0.14)', bot: 'rgba(240, 171, 252, 0.06)', border: 'rgba(34, 211, 238, 0.18)',
        backdrop: 'radial-gradient(100% 60% at 100% 0%, #3b0a5a 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, #052f3d 0%, transparent 65%), #06060d',
    },
    {
        id: 'paper', name: 'Paper', note: 'Warm light, easy reading', mode: 'light',
        bg: '#f7f3ec', raised: '#ffffff', text: '#2b2824', muted: '#6f675d', accent: '#c2410c', onAccent: '#ffffff', quote: '#9a3412',
        user: 'rgba(194, 65, 12, 0.08)', bot: 'rgba(43, 40, 36, 0.035)', border: 'rgba(43, 40, 36, 0.12)',
        backdrop: 'linear-gradient(180deg, #faf7f1 0%, #f1ebe1 100%)',
    },
    {
        id: 'cloud', name: 'Cloud', note: 'Crisp light blue', mode: 'light',
        bg: '#f3f6fb', raised: '#ffffff', text: '#1d2433', muted: '#5b6578', accent: '#2563eb', onAccent: '#ffffff', quote: '#1d4ed8',
        user: 'rgba(37, 99, 235, 0.08)', bot: 'rgba(29, 36, 51, 0.035)', border: 'rgba(29, 36, 51, 0.11)',
        backdrop: 'radial-gradient(120% 60% at 100% 0%, #dbe7ff 0%, transparent 60%), #f3f6fb',
    },
    {
        id: 'lavender', name: 'Lavender', note: 'Gentle light lilac', mode: 'light',
        bg: '#f6f3fb', raised: '#ffffff', text: '#272333', muted: '#686178', accent: '#7c3aed', onAccent: '#ffffff', quote: '#6d28d9',
        user: 'rgba(124, 58, 237, 0.08)', bot: 'rgba(39, 35, 51, 0.035)', border: 'rgba(39, 35, 51, 0.11)',
        backdrop: 'radial-gradient(120% 60% at 0% 0%, #ebe2ff 0%, transparent 60%), #f6f3fb',
    },
];

export function findTheme(id) {
    return THEMES.find(theme => theme.id === id) ?? null;
}

/** The stylesheet for one theme. `scope` is the selector the overrides hang off. */
export function themeCss(theme, scope) {
    if (!theme) return '';
    const t = theme;
    const translucent = color => `color-mix(in srgb, ${color} 86%, transparent)`;
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
`;
}
