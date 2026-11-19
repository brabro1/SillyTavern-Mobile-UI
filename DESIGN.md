# Pocket Tavern design guide

Rules for any change to how Pocket Tavern looks. Read this before touching `style.css`, `themes.js`, or the markup in `index.js`. The `frontend-design` skill in `.claude/skills/` works inside these rules. Where this file is specific, this file wins.

## What this is

- **Subject:** a phone-first layer over SillyTavern, used for long roleplay and story chats on Android (Termux), often one-handed, often at night.
- **Primary job:** reading and writing chat messages comfortably. Everything else (characters, lorebooks, presets, settings) is a quick detour that gets you back to the chat.
- **Audience:** people who spend hours in one conversation and tweak settings often. They know SillyTavern. They do not want a "cute" app, they want one that disappears.

## Principles

1. **The chat is the hero.** Message text is the biggest, most readable thing on the screen. Chrome (bars, tabs, buttons) stays quiet.
2. **Spend colour in one place.** One accent per theme, used only for meaning (see *Accent*). If everything is accented, nothing is.
3. **Thumb first.** Reachable controls sit at the bottom. Nothing you tap is smaller than 44px.
4. **Dense where you work, calm where you read.** Settings pages may be compact. Chat never is.
5. **Every change must survive all themes.** Light and dark, translucent and opaque.
6. **Decoration has to carry information.** Borders, dividers, badges, dots and glows exist because they tell the user something. Otherwise delete them.

## Tokens

Use the existing tokens in `style.css` (`:root`) and `themes.js`. Do not add a raw hex or a one-off pixel value when a token fits.

### Colour roles (already defined)

| Role | Token | Use |
|---|---|---|
| Page | `--stmui-surface`, `--stmui-solid` | App and sheet backgrounds |
| Cards, fields | `--stmui-raised`, `--stmui-raised-2` | Two raised levels, no more |
| Lines | `--stmui-line` | Every border and divider |
| Text | `--stmui-text` | Body and titles |
| Secondary | `--stmui-muted` | Narration, hints, captions |
| Tertiary | `--stmui-faint` | Decoration only: chevrons, handles. **Never** for something you can tap |
| Accent | `--stmui-accent`, `--stmui-accent-soft`, `--stmui-on-accent` | See below |

### Accent: only for these

- The one primary action on a screen (Send, Save, Add).
- The active tab and the current selection.
- On-state of a toggle, slider fill, focus ring.
- A live status (connected, context ring).

Not for: every row icon, every chip, every border, section titles, the A–Z strip, or dismiss buttons. Row icons use `--stmui-text` at `--stmui-muted` strength. A **Close** or **Cancel** control is never filled or accent-outlined.

### Danger

Destructive actions (Delete, Clear) use a dedicated danger colour. Keep the tile quiet by default (danger-coloured icon and label on a normal raised surface). Fill it only inside its confirmation. It never sits at the same weight as Favorite or Export, and it goes last in its group.

Do not use SillyTavern's stock green for "Lore" or "Chat lore" tiles. Style them like every other tile.

### Type scale

One family: the theme's `--mainFontFamily`, falling back to `system-ui`. Sizes are multiplied by `--stmui-text-scale`. Use only these steps:

| Step | Size | Use |
|---|---|---|
| caption | 12px | Hints, timestamps, badges. Smallest allowed. No 9–11px text |
| small | 14px | Secondary labels, chips, field labels |
| body | 16px | UI text, buttons, list rows |
| chat | 17–18px (`calc(var(--mainFontSize) * var(--stmui-text-scale))`) | Message text |
| title | 20px | Page and sheet titles |
| display | 26px | Character name on the card, empty-state headline |

Fold the existing 9 / 11 / 11.5 / 12.5 / 13 / 13.5 / 15 / 17 / 19px values into these steps when you touch them. Weights: 400 body, 600 for labels and titles. No all-caps labels, no letter-spaced eyebrows.

### Radius

Three values and a pill: `8px` (small inline things), `12px` (`--stmui-radius-sm`: fields, buttons, tiles), `16px` (`--stmui-radius`: cards, sheets), `999px` (pills, chips, avatars). Fold 14 / 15 / 18 / 20 / 22 / 24 into these.

### Spacing

Multiples of 4: `4, 8, 12, 16, 24`. Page gutter is 16px on every page, including hint text and headers. New code does not use 6px, 10px or 14px.

### Touch targets

- `--stmui-tap` (48px) for primary controls and list rows.
- **44px is the floor.** Anything smaller than 44px is a bug, including −/+ steppers, icon buttons and chevrons.
- A control can look smaller than its hit area (a 32px icon inside a 44px button). The hit area is what counts.

### Elevation and motion

- No drop shadows. Separation comes from `--stmui-raised`, `--stmui-line` and the sheet scrim. One exception, asked for by the owner: the floating message box has a soft shadow so it sits clearly above the chat. Don't add others.
- Motion answers a tap (sheet opens, row expands, toggle flips). 120–250ms, `--stmui-ease` / `--stmui-ease-sheet`. `--stmui-ease-pop` only for small confirmations.
- No entrance animation that plays on its own, no hover effects on the phone layout, and everything respects `prefers-reduced-motion` and the **Light** animations setting. The desktop layout gives rows, tiles, tabs and buttons a `--stmui-raised-2` hover, the same feedback a tap gets.

## Desktop layout (`html.stmui-wide`)

On whenever Pocket Tavern is on (Automatic covers computers; **Phones only** keeps a computer on the original interface) and the screen is at least 960 × 560 px; a sideways phone is short and keeps the phone layout. Everything is an override under `html.stmui-wide`, so the phone layout never changes because of it.

- **Rail:** the tab bar is a vertical rail on the left (`--stmui-rail-w`), 72px per tab, same active pill.
- **Panel:** a page opens beside the rail (`--stmui-panel-w`, 380–460px), one column, and stays open while the chat is used. Back, the tab or Escape closes it.
- **Chat column:** centred in the space right of the rail and panel, `--stmui-col` wide (SillyTavern's chat width, 560px at least). The composer, the message editor and search follow it.
- **Sheets and popups:** dialogs in the middle (560px, popups 640px, wide popups 1040px), all corners 16px, no grab handle; they fade and rise 12px.

## Size, message box and tucked tabs

- **Compact (`html.stmui-compact`):** top bar 48px, tab bar 52px, header picture 28px, name 14px, card padding 8 / 12px and 4px between cards, message line height 1.5. The chat text size itself does not change (that is the Chat text size setting). Every tap area stays 44px: buttons overlap the card padding with negative margins rather than shrinking. **Automatic** picks Compact when the screen's short side is under 380px (`SMALL_PHONE_BELOW`), read from `screen`, never the window, so the keyboard cannot flip it.
- **Compact start screen:** logo 28px, the version on one line (12px), title 16px, shortcuts as 32px chips in 44px rows (no border, `--stmui-raised-2`), recent chat cards with a 40px picture, 12px radius and a one-line preview.
- **Docked (`html.stmui-docked`):** the message box is a flat bar (hairline on top, the tab bar's surface, no radius, no shadow, 8px above the bottom edge). In portrait the bottom row is persona picture (44px, name in its label), the text field (`--stmui-raised`, 12px radius, 44px tall, shows the focus) and Send (44px), with persona and Send pinned level with the field's bottom as it grows; the other tools are a 44px row above. A phone held sideways keeps one row. SillyTavern's Send is placed with `position: absolute`, never moved in the DOM. The field shows a full `--stmui-accent` border while focused. SillyTavern's `clip-path` on `#send_textarea` (its script progress line) is removed, because it cut the field's top edge.
- **iPhone and iPad (`html.stmui-ios`):** SillyTavern's transform on `<html>` is removed. While the keyboard is up (`html.stmui-ios-kb`) the top bar, `#sheld`, pages, the prompt editor, an open lorebook entry and the message editor are placed from `--stmui-ios-top` / `--stmui-ios-h` (the visualViewport), never from `100dvh`. Anything new that is fixed to the screen needs the same treatment.
- **Full-screen layers** that are a message or entry made fixed (the message editor) set `align-self` / `justify-self: stretch`, so a look that aligns messages (Bubbles) cannot shrink them.
- **Desktop layout on a touch screen:** the chat column is at least 720px; the Themes sheet shows a Chat width slider (SillyTavern's own setting) whenever the desktop layout is on.
- **Keyboard on Android:** when the window shrinks or grows for the keyboard, `#sheld` (chat and message box together) slides as one piece with a 240ms transform from where it ended to its new place; opening keeps its old height until it lands. Never animate the message box or the chat on their own for the keyboard. The tab bar disappears at once (no transition) while `html.stmui-keyboard` is on. No slide on iPhone and iPad (Safari pans by itself), while editing a message, or with a page or sheet open.
- **Typed text** in the message box follows the Chat text size: `max(16px, 15px × --stmui-text-scale)`, line height 1.4. The tabs arrow is hidden while the keyboard is up.
- **Tucked tabs (`html.stmui-tabs-tucked`):** in a chat on the phone layout the tab bar slides down and is `visibility: hidden` once gone. The arrow is the first button in the message box's tool row (44px, `--stmui-muted`, `aria-expanded`, `aria-controls`), and it flips to point down while the tabs are out. They tuck again on typing, scrolling the chat by hand, tapping Chat, or changing chats. Never on pages, the start screen or the desktop layout.
- **Medium screens (760px and up, not the desktop layout):** message cards and the floating box are a centred column, at most 720px.

## Themes (`themes.js`)

- A theme is not a hue swap. Seven of the twelve themes currently share one recipe: tinted dark background, two radial glows, one saturated accent. A new theme must differ in structure too (surface lightness, contrast character, backdrop), or it is not added.
- Backdrops: at most one soft glow, or flat. No two-glow gradients on new themes.
- **Contrast is checked, not eyeballed:** text on surface ≥ 4.5:1, `onAccent` on `accent` ≥ 4.5:1, accent and icons on surface ≥ 3:1. Midnight's `onAccent` (white on `#8b7cf6`, 3.3:1) currently fails and needs a darker `onAccent` or accent.
- Be aware of the common generated look: cream background with a terracotta accent. **Paper** (`#f7f3ec` + `#c2410c`) is exactly that, and AMOLED (black + one bright accent) is the other usual default. Keep them if you like them, but do not add more themes in those families.

## Components

- **Tabs:** icon above label, active state is a filled soft-accent pill. Max five.
- **Message cards:** header (avatar, name, date), full-width text, actions in one row. Action icons ("…", edit) are real controls: use `--stmui-muted`, not `--stmui-faint`.
- **Swipe pill:** shown only when there is more than one swipe, or when the last message offers a new one.
- **Composer:** the border is neutral at rest and accent only while focused. The context ring shows the number with its unit or a label on tap.
- **Sheets:** handle, title, content. Dismiss with the handle, the scrim or back. A Close button is plain text, not an outlined button.
- **Settings rows:** label left, control right, helper text under the label, a hairline between rows. Checkboxes in Pocket Tavern pages are always the pill toggle, never the browser checkbox. The helper text on SillyTavern's pages is SillyTavern's own tooltip (`title` or the ⓘ icon), shown at 14px `--stmui-muted`, two lines with a tap for the rest. Icon-only toggles (no text) keep SillyTavern's look.
- **Switches:** off is a `--stmui-muted` knob on `--stmui-raised-2` with a muted outline (it must read on light themes); on is an `--stmui-on-accent` knob on the accent.
- **Settings page:** opens on a list of sections (one grouped list, icon, title, one line on what is inside, chevron). A section shows only its own controls; the top bar shows its name and back returns to the list. Controls are marked, never moved, and anything unrecognised goes to the last general section.
- **Menus:** SillyTavern's ☰ and wand pop-ups open as sheets. Items are grouped only when the groups mean something (Reply, This chat, Chats), each has a one-line description, and a destructive item goes last in danger colour.
- **Placeholder avatars:** one tonal colour derived from the theme (not a random rainbow), with the initial. No half-body silhouette.
- **Quick replies and other extensions' buttons in the message box:** quick replies are 32px chips (`--stmui-raised-2`, no border, pill) in 44px rows, with the tap area filling the row, and they wrap rather than scroll. Guided Generations' buttons are 44px with no border and `--stmui-muted` icons, on one line, with any quick replies it holds on the line below. The text field always keeps its own full-width row (the layout is pinned with `!important` against other CSS).
- **Guided Generations (`html.stmui-gg`, only when it is installed and the switch is on):** its row is hidden (never removed) and one guide button (compass, 44px, `--stmui-muted`) sits right before Send. A count badge (12px, `--stmui-text` on `--stmui-surface`, no accent) shows active persistent guides. The sheet: an instruction card (`--stmui-raised`, 12px radius, tap to edit), then "Steer the reply", "Your message" and "More", each row with a plain name and one line. Its menus become sheets built from its own items and descriptions; the sheet presses its real buttons so its logic runs. Its popups are bottom sheets (dialogs on the desktop layout) above our bars (z-index 5000), 44px close and controls, hover-only choices shown as chips, and they count as layers for back and Escape.
- **Other chat styles:** the message cards apply only in SillyTavern's Flat style. Bubbles, Document and Moonlit Echoes' five styles (body classes `echostyle`, `whisperstyle`, `hushstyle`, `ripplestyle`, `tidestyle`) draw the messages themselves; the card selectors list them in one `:not(...)` (same specificity as before). A chat style from another extension gets added there.
- **The row next to Send is full on a phone:** Send never shrinks. An extension button that lands in that row (ScenePulse) is hidden and offered in the wand's Tools sheet instead, with its own icon and a one-line note. Floating buttons from extensions never sit over the message box.
- **Theme pins:** `--topBarBlockSize`, the arrow's display, ☰'s size and the message box's opacity are pinned with `!important`, because theme extensions set them too. The editor is a page of its own: while it is open, a mask on `#chat` is turned off (it clipped the editor, which is fixed inside the chat) and its padding, widths and frame are pinned.
- **Input History:** its buttons sit at the end of the text field (44px each); the arrows show only on an empty box or after they recalled a message; the field reserves room for whatever shows.
- **Lists of records (characters, lorebook entries):** one row, one clear title, at most two lines of metadata. Status dots always have a label or a tooltip you can reach by tap.

## Writing

- Sentence case. Plain verbs. "Save changes", not "Submit".
- A subtitle exists only if it adds information. "Backgrounds / Chat backgrounds" is filler. "API / Connected" is not.
- Errors say what happened and what to do. They do not apologise.
- The same action keeps the same name everywhere (the button that says "Delete" leads to a confirm that says "Delete").
- Search placeholders must fit on the narrowest supported phone (320px). Shorten them rather than letting them clip.

## Before you ship a UI change

1. Run `node tests/screenshots.mjs` (see the header of that file) and look at the changed screens on a 375px viewport, in at least one dark and one light theme.
2. No new raw colour, radius, font size or spacing value outside this guide.
3. No tappable thing under 44px. No tappable thing using `--stmui-faint`.
4. Accent appears only in the roles listed above.
5. `node tests/check.mjs` and `node tests/phone.mjs` pass.
6. Remove one decoration. If nothing was missed, leave it removed.

## Known gaps (from the November 2026 audit)

Fixed on the design branch: Delete tile weight and stock green Lore tiles; accent removed from row icons, tile icons, chips, keyword chips, the A–Z strip, the ⚡ button, avatar rings, recent-chat badges and thread line, the persona card gradient and the Close outline; message action icons now `--stmui-muted`; Midnight `onAccent` (now 5.5:1, all 12 themes pass the contrast rule); preset steppers, swipe arrows, composer tools, context ring and message buttons at a 44px hit area; composer border neutral at rest and drop shadows removed; "1/1" hidden with a single swipe; context ring shows "46%"; Presets hint on the content edge; labelled checkboxes on settings pages are pill toggles; More search placeholder shortened; filler More subtitles removed.

Second pass (frontend-design and ui-ux-pro-max): themes rebuilt so each differs in structure, not only hue (flat or at most one glow, different surface lightness, accents tuned instead of stock Tailwind 400 colours; Paper is ink blue on grey-white paper instead of cream and terracotta; AMOLED uses candle gold instead of acid teal); all twelve pass the contrast rule. All-caps letter-spaced labels removed (badges, menu and recent-chat headings, chat-history dates, the context ring's unit). Middle-dot meta strings replaced. The sparkle icon is gone (thinking uses a bulb, Model a flask, Phone features a phone). Every drop shadow removed; things floating over content get a hairline instead. Radii folded to 12 / 16 / pill everywhere, and text sizes folded to 12 / 14 / 16 / 20 (icon sizes untouched).

Still open:

- **Accent in SillyTavern's own markup:** the `?` help icons and some stock controls inside pages still use the accent.
- **Reading face:** ui-ux-pro-max suggests a book serif (Crimson Pro, or Android's built-in Noto Serif) for long fiction. This guide keeps one family, so it is only a proposal, for example as an optional "Book font" for message text.
- **Placeholder avatars:** not a Pocket Tavern issue. The rainbow letter pictures in the README screenshots are the test copy's sample characters; Pocket Tavern draws no placeholder avatars.
