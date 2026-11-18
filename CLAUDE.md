# Pocket Tavern

A SillyTavern extension that gives phones an app-style layout. Plain JavaScript and CSS, no build step. Files: `index.js` (logic and markup), `style.css`, `themes.js`, `icons.js`, `locales.js`.

## UI work

Read [DESIGN.md](DESIGN.md) before changing anything visual (`style.css`, `themes.js`, or markup in `index.js`). It sets the type scale, radii, spacing, tap sizes, accent rules and theme checks. Use the `frontend-design` skill inside those rules, and where the two differ, DESIGN.md wins.

Do not add raw colours, font sizes, radii or spacing values that the guide doesn't allow, and do not make anything tappable smaller than 44px.

## Checks

From `tests/`: `npm run check` and `npm run phone`. `node screenshots.mjs` retakes the README screenshots and needs a running SillyTavern with test data (see the header of that file).
