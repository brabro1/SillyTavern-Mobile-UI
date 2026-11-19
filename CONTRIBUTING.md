# Contributing to Pocket Tavern

Thanks for wanting to help! Pocket Tavern is in alpha, so bug reports, ideas and pull requests are all welcome.

## Reporting bugs and ideas

Use the [issue forms](https://github.com/brabro1/SillyTavern-PocketTavern/issues/new/choose). A screenshot, your device and browser, and your SillyTavern version help the most. Please never share private chats, API keys or other personal data.

## How the code is laid out

Pocket Tavern is a plain SillyTavern extension with no build step:

| File | What's in it |
| --- | --- |
| `index.js` | Everything Pocket Tavern does |
| `style.css` | All styles. Everything is scoped under classes on `<html>` (like `stmui-on`), so turning it off brings SillyTavern back |
| `themes.js`, `icons.js` | The themes and the icon set |
| `locales.js`, `i18n.js` | Translations of Pocket Tavern's own labels |
| `changelog.js`, `CHANGELOG.md` | The What's new list and the full history |
| `termux/setup.sh` | The one-tap start shortcuts for Android |
| `tests/` | The checks, the speed test, the audit and the screenshot script (not needed to use the extension) |

The internal `stmui` names and the `mobileUI` settings key come from the project's old name, Mobile UI. They stay as they are so existing settings keep working.

## Before you open a pull request

1. Run the quick checks (Node 20 or newer):
   ```bash
   node tests/check.mjs
   ```
2. If you can, run the phone test against a SillyTavern with Pocket Tavern installed:
   ```bash
   cd tests && npm install && ST_URL=http://127.0.0.1:8000 CHROME_CHANNEL=chrome node phone.mjs
   ```
3. New labels go through `t()` and get a row in `locales.js`.
4. If you changed something that runs often (scrolling, typing, streaming, opening pages), compare the speed with Pocket Tavern on and off:
   ```bash
   cd tests && ST_URL=http://127.0.0.1:8000 CHROME_CHANNEL=chrome node perf.mjs
   ```
   `PROFILE="type"` (any part of a scenario name, here "type a message") shows the busiest functions and what made the page restyle.
5. For a user-facing change, add a line to `CHANGELOG.md` and `changelog.js`, and update the README.
6. If you changed how Pocket Tavern treats another extension (Guided Generations, Input History), install those in your test SillyTavern and run `node compat.mjs` (same `ST_URL` and `CHROME_CHANNEL`). It blocks requests to the AI, so nothing is generated.
7. If you changed anything that is fixed to the screen, the keyboard handling or wide layouts, run `node ios.mjs` too (iPhone and iPad sizes, Safari's keyboard faked). `ENGINE=webkit node ios.mjs` runs it in WebKit, Safari's engine, after `npx playwright install webkit`.
8. For a polish pass, `node audit.mjs results/audit` (same `ST_URL` and `CHROME_CHANNEL`) walks every screen at three sizes and with the keyboard up, and saves a picture of each.
9. If the look changed, retake the screenshots with test data only (never your own chats), then redraw the banner from `docs/brand/banner.html`:
   ```bash
   cd tests && ST_URL=http://127.0.0.1:8000 CHROME_CHANNEL=chrome node screenshots.mjs
   ```

Keep changes small and focused, and write texts people see in plain, friendly words.

## License

By contributing you agree that your work is released under the [MIT License](LICENSE).
