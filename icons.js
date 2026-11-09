/**
 * Mobile UI icon set: rounded line icons on a 24px grid (Lucide style, ISC
 * license, see THIRD_PARTY_NOTICES.md).
 *
 * Used two ways:
 *  - our own chrome (tab bar, app bar, menus) renders them as inline <svg>;
 *  - SillyTavern's Font Awesome glyphs are swapped for them with a CSS mask,
 *    so every panel shares one consistent icon style. Glyphs without a match
 *    keep their Font Awesome look.
 */

export const ICONS = {
    'menu': '<path d="M4 6h16M4 12h16M4 18h16"/>',
    'x': '<path d="M18 6 6 18M6 6l12 12"/>',
    'circle-x': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'home': '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'zoom-in': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
    'zoom-out': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M8 11h6"/>',
    'rotate-cw': '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    'external': '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'plus': '<path d="M5 12h14M12 5v14"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'circle-chevron-down': '<circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-4-4"/>',
    'circle-chevron-up': '<circle cx="12" cy="12" r="10"/><path d="m8 14 4-4 4 4"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7M19 12H5"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7M12 19V5"/>',
    'arrow-down': '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    'ellipsis': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    'ellipsis-vertical': '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
    'pencil': '<path d="M21.17 6.81a1 1 0 0 0-3.98-3.98L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
    'square-pen': '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.38 2.63a1 1 0 0 1 3 3l-9.02 9.01a2 2 0 0 1-.85.5l-2.87.85a.5.5 0 0 1-.62-.62l.84-2.88a2 2 0 0 1 .51-.85z"/>',
    'trash': '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
    'copy': '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'save': '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7"/>',
    'file-import': '<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4M2 15h10M9 18l3-3-3-3"/>',
    'file-export': '<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4 7V4a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2H4M5 11l-3 3 3 3M2 14h10"/>',
    'file-plus': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M9 15h6M12 12v6"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
    'reset': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'refresh': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>',
    'history': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    'help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
    'alert-circle': '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    'key': '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4M21 2l-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    'maximize': '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'unlock': '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    'chats': '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>',
    'chat': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
    'chat-plus': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/>',
    'grid': '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>',
    'star': '<path d="M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.91l5.16-.75a2.12 2.12 0 0 0 1.6-1.16z"/>',
    'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    'unlink': '<path d="m18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71M5.17 11.75l-1.71 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71M8 2v3M2 8h3M16 22v-3M22 16h-3"/>',
    'bulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
    'image': '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    'eye': '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M10.73 5.08a10.74 10.74 0 0 1 11.2 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49M14.08 14.16a3 3 0 0 1-4.24-4.24M17.48 17.5a10.75 10.75 0 0 1-15.42-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14M2 2l20 20"/>',
    'skull': '<path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/><path d="m12.5 17-.5-1-.5 1z"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'smile': '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    'cloud-download': '<path d="M12 13v8M8 17l4 4 4-4"/><path d="M4.39 15.27A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.44 8.28"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    'tag': '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
    'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    'send': '<path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.63l-19 6.5a.5.5 0 0 0-.02.93l7.93 3.18a2 2 0 0 1 1.11 1.11zM21.85 2.15 10.91 13.09"/>',
    'wand': '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72M14 7l3 3M5 6v4M19 14v4M10 2v2M7 8H3M21 16h-4M11 3H9"/>',
    'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    'contact': '<path d="M16 2v2M7 22v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M8 2v2"/><circle cx="12" cy="11" r="3"/><rect x="3" y="4" width="18" height="18" rx="2"/>',
    'book': '<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'sliders': '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
    'plug': '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>',
    'type': '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'puzzle': '<path d="M15.39 4.39a1 1 0 0 0 1.68-.47 2.5 2.5 0 1 1 3.01 3.01 1 1 0 0 0-.47 1.68l1.68 1.68a2.41 2.41 0 0 1 0 3.42l-1.68 1.68a1 1 0 0 1-1.68-.47 2.5 2.5 0 1 0-3.01 3.01 1 1 0 0 1 .47 1.68l-1.68 1.68a2.41 2.41 0 0 1-3.42 0l-1.68-1.68a1 1 0 0 0-1.68.47 2.5 2.5 0 1 1-3.01-3.01 1 1 0 0 0 .47-1.68l-1.68-1.68a2.41 2.41 0 0 1 0-3.42l1.68-1.68a1 1 0 0 1 1.68.47 2.5 2.5 0 1 0 3.01-3.01 1 1 0 0 1-.47-1.68l1.68-1.68a2.41 2.41 0 0 1 3.42 0z"/>',
    'palette': '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>',
    'phone': '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    'zap': '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    'languages': '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
    'brush': '<path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>',
    'megaphone': '<path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    'folder': '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
    'folder-plus': '<path d="M12 10v6M9 13h6M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    'power': '<path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.77.04"/>',
    'stop': '<circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    'play': '<path d="M6 4l14 8-14 8z"/>',
    'eraser': '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21M22 21H7M5 11l9 9"/>',
    'filter': '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
    'scroll': '<path d="M19 17V5a2 2 0 0 0-2-2H4M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    'note': '<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>',
    'scale': '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    'chart': '<path d="M21 12c.55 0 1-.45.98-1A10 10 0 0 0 13 2.02c-.55-.05-1 .4-1 .98v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',
    'shuffle': '<path d="m18 14 4 4-4 4M18 2l4 4-4 4M2 18h1.97a4 4 0 0 0 3.3-1.7l5.45-8.6a4 4 0 0 1 3.3-1.7H22M2 6h1.97a4 4 0 0 1 3.3 1.7l.68 1.08M22 18h-5.97a4 4 0 0 1-3.3-1.7l-.68-1.08"/>',
    'mask': '<path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2 8 8 0 0 0-5-2H2z"/><path d="M6 11c1.5 0 3 .5 3 2-2 0-3 0-3-2zM18 11c-1.5 0-3 .5-3 2 2 0 3 0 3-2z"/>',
    'bookmark': '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    'clipboard': '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'music': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'film': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M3 7.5h4M3 12h18M3 16.5h4M17 3v18M17 7.5h4M17 16.5h4"/>',
    'flask': '<path d="M10 2v7.53a2 2 0 0 1-.21.9L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.07-10.12a2 2 0 0 1-.21-.9V2M8.5 2h7M7 16h10"/>',
    'desktop': '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
    'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z"/>',
    'move': '<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
    'grip': '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
    'list': '<path d="M3 12h.01M3 18h.01M3 6h.01M8 12h13M8 18h13M8 6h13"/>',
    'minimize': '<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>',
    'minus': '<path d="M5 12h14"/>',
    'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    'sort': '<path d="m3 16 4 4 4-4M7 20V4M11 4h10M11 8h7M11 12h4"/>',
    'crown': '<path d="M11.56 3.27a.5.5 0 0 1 .88 0l2.95 5.6a1 1 0 0 0 1.52.29l4.27-3.66a.5.5 0 0 1 .82.5l-2.83 10.25a1 1 0 0 1-.97.73H5.81a1 1 0 0 1-.97-.73L2.02 6.02a.5.5 0 0 1 .82-.5l4.27 3.66a1 1 0 0 0 1.52-.29zM5 21h14"/>',
    'sparkles': '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0zM20 3v4M22 5h-4M4 17v2M5 18H3"/>',
};

/** Font Awesome class → icon above. Anything not listed keeps its Font Awesome glyph. */
export const FA_MAP = {
    'fa-bars': 'menu',
    'fa-xmark': 'x', 'fa-times': 'x', 'fa-close': 'x', 'fa-x': 'x',
    'fa-circle-xmark': 'circle-x', 'fa-times-circle': 'circle-x',
    'fa-check': 'check', 'fa-circle-check': 'circle-check', 'fa-check-circle': 'circle-check',
    'fa-house': 'home', 'fa-home': 'home', 'fa-magnifying-glass-plus': 'zoom-in', 'fa-magnifying-glass-minus': 'zoom-out',
    'fa-plus': 'plus',
    'fa-chevron-down': 'chevron-down', 'fa-angle-down': 'chevron-down', 'fa-caret-down': 'chevron-down',
    'fa-chevron-up': 'chevron-up', 'fa-angle-up': 'chevron-up', 'fa-caret-up': 'chevron-up',
    'fa-chevron-left': 'chevron-left', 'fa-angle-left': 'chevron-left', 'fa-angles-left': 'chevron-left',
    'fa-chevron-right': 'chevron-right', 'fa-angle-right': 'chevron-right', 'fa-angles-right': 'chevron-right',
    'fa-circle-chevron-down': 'circle-chevron-down',
    'fa-circle-chevron-up': 'circle-chevron-up',
    'fa-left-long': 'arrow-left', 'fa-arrow-left': 'arrow-left',
    'fa-arrow-right': 'arrow-right', 'fa-right-long': 'arrow-right',
    'fa-arrow-up': 'arrow-up', 'fa-arrow-down': 'arrow-down',
    'fa-ellipsis': 'ellipsis', 'fa-ellipsis-h': 'ellipsis',
    'fa-ellipsis-vertical': 'ellipsis-vertical', 'fa-ellipsis-v': 'ellipsis-vertical',
    'fa-pencil': 'pencil', 'fa-pen': 'pencil', 'fa-pencil-alt': 'pencil',
    'fa-pen-to-square': 'square-pen', 'fa-edit': 'square-pen', 'fa-user-pen': 'square-pen',
    'fa-trash-can': 'trash', 'fa-trash': 'trash', 'fa-trash-alt': 'trash',
    'fa-copy': 'copy', 'fa-clone': 'copy',
    'fa-save': 'save', 'fa-floppy-disk': 'save',
    'fa-file-import': 'file-import',
    'fa-file-export': 'file-export',
    'fa-file-circle-plus': 'file-plus',
    'fa-file-alt': 'file-text', 'fa-file-lines': 'file-text', 'fa-file': 'file-text',
    'fa-recycle': 'reset', 'fa-rotate-left': 'reset', 'fa-undo': 'reset',
    'fa-repeat': 'refresh', 'fa-arrows-rotate': 'refresh', 'fa-rotate': 'refresh', 'fa-sync': 'refresh', 'fa-rotate-right': 'refresh',
    'fa-clock-rotate-left': 'history', 'fa-history': 'history',
    'fa-circle-info': 'info', 'fa-info-circle': 'info',
    'fa-circle-question': 'help', 'fa-question-circle': 'help',
    'fa-circle-exclamation': 'alert-circle', 'fa-exclamation-circle': 'alert-circle',
    'fa-triangle-exclamation': 'alert-triangle', 'fa-exclamation-triangle': 'alert-triangle',
    'fa-key': 'key',
    'fa-maximize': 'maximize', 'fa-expand': 'maximize', 'fa-window-maximize': 'maximize',
    'fa-lock': 'lock', 'fa-unlock': 'unlock',
    'fa-comments': 'chats', 'fa-address-book': 'contact',
    'fa-comment': 'chat', 'fa-comment-dots': 'chat',
    'fa-table-cells-large': 'grid', 'fa-table-cells': 'grid',
    'fa-star': 'star',
    'fa-link': 'link', 'fa-link-slash': 'unlink',
    'fa-lightbulb': 'bulb',
    'fa-image': 'image', 'fa-images': 'image', 'fa-panorama': 'image', 'fa-image-portrait': 'image',
    'fa-globe': 'globe',
    'fa-eye': 'eye', 'fa-eye-slash': 'eye-off',
    'fa-skull': 'skull',
    'fa-magnifying-glass': 'search', 'fa-search': 'search',
    'fa-face-smile': 'smile',
    'fa-cloud-arrow-down': 'cloud-download',
    'fa-download': 'download', 'fa-upload': 'upload',
    'fa-tags': 'tag', 'fa-tag': 'tag',
    'fa-flag': 'flag',
    'fa-paper-plane': 'send',
    'fa-wand-magic-sparkles': 'wand', 'fa-magic': 'wand',
    'fa-user': 'user',
    'fa-user-plus': 'user-plus',
    'fa-users': 'users', 'fa-users-gear': 'users', 'fa-people-arrows': 'users',
    'fa-address-card': 'contact', 'fa-passport': 'contact',
    'fa-book-atlas': 'book', 'fa-book': 'book', 'fa-book-open': 'book',
    'fa-sliders': 'sliders',
    'fa-plug': 'plug', 'fa-plug-circle-exclamation': 'plug', 'fa-plug-circle-check': 'plug',
    'fa-font': 'type',
    'fa-gear': 'settings', 'fa-cog': 'settings', 'fa-user-cog': 'settings', 'fa-user-gear': 'settings', 'fa-gears': 'settings',
    'fa-cubes': 'puzzle', 'fa-puzzle-piece': 'puzzle',
    'fa-palette': 'palette',
    'fa-mobile-screen-button': 'phone', 'fa-mobile-screen': 'phone',
    'fa-bolt': 'zap',
    'fa-language': 'languages',
    'fa-paintbrush': 'brush',
    'fa-bullhorn': 'megaphone',
    'fa-folder': 'folder', 'fa-folder-open': 'folder', 'fa-folder-plus': 'folder-plus',
    'fa-right-from-bracket': 'log-out',
    'fa-power-off': 'power',
    'fa-circle-stop': 'stop', 'fa-stop': 'stop',
    'fa-play': 'play',
    'fa-eraser': 'eraser',
    'fa-filter': 'filter', 'fa-filter-circle-xmark': 'filter',
    'fa-scroll': 'scroll',
    'fa-note-sticky': 'note',
    'fa-scale-balanced': 'scale',
    'fa-pie-chart': 'chart', 'fa-chart-pie': 'chart',
    'fa-shuffle': 'shuffle',
    'fa-user-secret': 'mask',
    'fa-bookmark': 'bookmark',
    'fa-paste': 'clipboard', 'fa-clipboard': 'clipboard',
    'fa-envelope-open-text': 'mail', 'fa-envelope': 'mail',
    'fa-music': 'music',
    'fa-film': 'film',
    'fa-flask': 'flask',
    'fa-desktop': 'desktop',
    'fa-ranking-star': 'trophy',
    'fa-up-down-left-right': 'move',
    'fa-grip': 'grip', 'fa-grip-vertical': 'grip',
    'fa-list-ul': 'list', 'fa-list': 'list',
    'fa-magic-wand-sparkles': 'wand', 'fa-wand-magic': 'wand',
    'fa-compress': 'minimize', 'fa-minimize': 'minimize',
    'fa-minus': 'minus',
    'fa-user-shield': 'shield', 'fa-shield': 'shield', 'fa-shield-halved': 'shield',
    'fa-notes-medical': 'note',
    'fa-arrow-down-9-1': 'sort', 'fa-arrow-down-wide-short': 'sort', 'fa-sort': 'sort',
    'fa-crown': 'crown',
    'fa-hat-wizard': 'sparkles',
    'fa-person-circle-question': 'user-plus',
};

const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

/** Inline SVG element for our own chrome. */
export function svgIcon(name, className = '') {
    const holder = document.createElement('span');
    holder.innerHTML = `${SVG_OPEN}${ICONS[name] ?? ICONS.grid}</svg>`;
    const svg = holder.firstElementChild;
    svg.setAttribute('class', `stmui-svg ${className}`.trim());
    return svg;
}

/** Stylesheet that swaps mapped Font Awesome glyphs for the icons above. */
export function iconCss(scope) {
    const maskFor = name => {
        const svg = `${SVG_OPEN.replace('currentColor', '#000')}${ICONS[name]}</svg>`;
        return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    };
    const byIcon = new Map();
    for (const [fa, name] of Object.entries(FA_MAP)) {
        if (!ICONS[name]) continue;
        if (!byIcon.has(name)) byIcon.set(name, []);
        byIcon.get(name).push(fa);
    }
    const all = Object.keys(FA_MAP).map(fa => `${scope} .${fa}::before`).join(',\n');
    let css = `${all} {
    content: "" !important;
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: -0.14em;
    background-color: currentColor;
    -webkit-mask: var(--stmui-icon) center / contain no-repeat;
    mask: var(--stmui-icon) center / contain no-repeat;
}\n`;
    for (const [name, classes] of byIcon) {
        css += `${classes.map(fa => `${scope} .${fa}`).join(', ')} { --stmui-icon: ${maskFor(name)}; }\n`;
    }
    return css;
}

/** A data-URI mask for one icon, for CSS `mask` (e.g. notification icons). */
export function iconUrl(name) {
    const svg = `${SVG_OPEN.replace('currentColor', '#000')}${ICONS[name] ?? ''}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
