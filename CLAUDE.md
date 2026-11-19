# Pocket Tavern

A SillyTavern extension with two layouts on one shared core: **Pocket Tavern on phones** (Android, iPhone, iPad held upright) and **Pocket Tavern on desktop** (computers, tablets held sideways). Same themes, tokens and logic; separate layout, UI and design. iPhone and iPad are core devices, not extras. Plain JavaScript and CSS, no build step. Files: `index.js` (logic and markup), `style.css`, `themes.js`, `icons.js`, `locales.js`, `changelog.js`.

## Workflow

Use the `release` skill (`.claude/skills/release/`, kept out of git because it holds local paths) for every change: reproducing a report, the design rules, the test copy, tests, docs, screenshots, the banner, versioning and publishing. Follow it in order.

## Phone, desktop or both

Before any change, decide where it belongs: **Phone**, **Desktop**, or **Both**, and say so in the plan, the changelog and the reply. Phone-only styles go under `html:not(.stmui-wide)`, desktop-only styles under `html.stmui-wide`; shared logic and tokens stay in the core. Check phone changes on Android and iPhone/iPad sizes, desktop changes at 1366 × 700, 1440 × 900 and 1920 × 1080. See "Two layouts, one core" in DESIGN.md.

## UI work

Read [DESIGN.md](DESIGN.md) before changing anything visual (`style.css`, `themes.js`, or markup in `index.js`). It sets the type scale, radii, spacing, tap sizes, accent rules and theme checks. Use the `frontend-design` skill inside those rules, and where the two differ, DESIGN.md wins.

Do not add raw colours, font sizes, radii or spacing values that the guide doesn't allow, and do not make anything tappable smaller than 44px.

## Checks

From `tests/`: `npm run check`, `npm run phone` (the phone walkthrough plus desktop steps) and `node ios.mjs` (iPhone and iPad; also with `ENGINE=webkit`). `node screenshots.mjs` retakes the README screenshots and `node brand.mjs` redraws the banner; both need a running SillyTavern with test data (see the header of each file).

## Never

- Commit credentials, personal SillyTavern data, chat histories or the owner's lorebook names.
- Use the owner's real email in commands or commits (see the release skill for the commit identity).
- Post on Reddit or anywhere public. Draft the text; the owner posts it.
