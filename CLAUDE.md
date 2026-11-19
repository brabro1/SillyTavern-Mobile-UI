# Pocket Tavern

A SillyTavern extension that gives phones an app-style layout, and computers a desktop layout of their own. Phones come first. Plain JavaScript and CSS, no build step. Files: `index.js` (logic and markup), `style.css`, `themes.js`, `icons.js`, `locales.js`, `changelog.js`.

## Workflow

Use the `release` skill (`.claude/skills/release/`, kept out of git because it holds local paths) for every change: reproducing a report, the design rules, the test copy, tests, docs, screenshots, the banner, versioning and publishing. Follow it in order.

## UI work

Read [DESIGN.md](DESIGN.md) before changing anything visual (`style.css`, `themes.js`, or markup in `index.js`). It sets the type scale, radii, spacing, tap sizes, accent rules and theme checks. Use the `frontend-design` skill inside those rules, and where the two differ, DESIGN.md wins.

Do not add raw colours, font sizes, radii or spacing values that the guide doesn't allow, and do not make anything tappable smaller than 44px.

## Checks

From `tests/`: `npm run check` and `npm run phone`. `node screenshots.mjs` retakes the README screenshots and `node brand.mjs` redraws the banner; both need a running SillyTavern with test data (see the header of each file).

## Never

- Commit credentials, personal SillyTavern data, chat histories or the owner's lorebook names.
- Use the owner's real email in commands or commits (see the release skill for the commit identity).
- Post on Reddit or anywhere public. Draft the text; the owner posts it.
