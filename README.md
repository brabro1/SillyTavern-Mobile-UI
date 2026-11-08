# Mobile UI for SillyTavern

Makes SillyTavern on your phone look and feel like a real app: tabs at the bottom, your character at the top, big readable text, and buttons sized for your thumb.

| Before | After |
| :---: | :---: |
| ![SillyTavern on a phone without Mobile UI](docs/screenshots/before.jpg) | ![The same chat with Mobile UI](docs/screenshots/chat.jpg) |

It only turns on for phones. On your computer SillyTavern looks the same as always.

## What you get

**Tabs at the bottom.** Chat, Characters, Lorebooks and Presets are one tap away. Everything else (API, Personas, Formatting, Settings, Backgrounds, Extensions) is under **More**.

**Your character at the top.** See who you're talking to and whether you're connected. Tap the name to open the character card. Buttons on the right open your chat history or start a new chat.

**The back gesture works.** Swiping back closes whatever is open (a menu, a popup, a page) instead of leaving SillyTavern.

**A cleaner chat.** Messages sit in soft cards with bigger text. The message box is rounded and the send button is easy to hit. While you type, the tabs step aside so you get more room.

**Pages that fit your screen.** Every panel opens full-screen with a clear title and a back arrow. Settings are grouped into cards, sliders are full-width with the number beside them, and nothing spills off the side of the screen.

**Menus and popups that come up from the bottom.** The ☰ menu, confirm boxes and chat history slide up from the bottom of the screen, within reach of your thumb.

**Easy lorebook picking.** Pick lorebooks from a searchable list with big checkboxes instead of the tiny two-line box. Remove one with the ✕ on its chip. It works for global, character, chat and persona lorebooks.

**Picking a character opens their chat.** Tap someone in the Characters list and you're in the conversation.

**Follows your theme.** It uses the colors of whatever SillyTavern theme you have, dark or light.

| Characters | More | Lorebooks |
| :---: | :---: | :---: |
| ![Character list](docs/screenshots/characters.jpg) | ![More menu](docs/screenshots/more.jpg) | ![Lorebook picker](docs/screenshots/lorebooks.jpg) |

| Presets | ☰ menu | Light theme |
| :---: | :---: | :---: |
| ![Presets page](docs/screenshots/presets.jpg) | ![Options menu](docs/screenshots/menu.jpg) | ![Light theme](docs/screenshots/light.jpg) |

## Install

1. Open SillyTavern on your phone.
2. Tap the **Extensions** icon (the stacked cubes in the top bar), then **Install extension**.
3. Paste this link and tap install:
   ```
   https://github.com/brabro1/SillyTavern-Mobile-UI
   ```
4. Reload the page.

**Or from Termux:**

```bash
cd ~/SillyTavern/data/default-user/extensions
git clone https://github.com/brabro1/SillyTavern-Mobile-UI
```

Then reload SillyTavern in your browser. (Need git? Run `pkg install git` first.)

## Update

In SillyTavern: **More → Extensions → Manage extensions**, then tap update next to Mobile UI.

Or in Termux:

```bash
cd ~/SillyTavern/data/default-user/extensions/SillyTavern-Mobile-UI
git pull
```

Reload the page afterwards. If you still see the old look, reload once more. Chrome sometimes keeps the old files for a moment.

## Settings

Find them under **More → Mobile UI settings**. Each part can be switched on or off:

| Setting | What it does |
| --- | --- |
| Enable Mobile UI | Turns everything on or off. Off gives you the normal SillyTavern back. |
| Use it on this device | **Automatic** (phones only), **Always on** or **Off**. This is saved per device. |
| App navigation | The top bar and the bottom tabs. |
| Modern chat look | Message cards, bigger text, rounded message box. |
| Touch-friendly panels | Bigger buttons and sliders, roomier settings, menus from the bottom. |
| Back gesture closes panels | Android back closes the open page, popup or menu first. |
| Easy lorebook picker | The searchable lorebook list. |
| Lorebooks shortcut in the ✨ menu | Opens the lorebook list from the chat. |
| Searchable long dropdowns | Experimental: long dropdowns (models, presets) get the same searchable list. Off by default. |

**Phone not detected?** Set "Use it on this device" to **Always on**.

## Good to know

- Your characters, chats and lorebooks are never changed. Mobile UI only changes how things look and where buttons are.
- It works alongside your other extensions. Extensions that add their own panels show up under **More**.
- Made for SillyTavern 1.19. Use an up-to-date browser; it was built and checked with Chrome.
- The menus and labels are in English.

## Uninstall

**More → Extensions → Manage extensions**, then delete Mobile UI. To just pause it, untick **Enable Mobile UI**.

## License

MIT
