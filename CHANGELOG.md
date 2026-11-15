# Changelog

## 2.8.1

- Lorebook entries: SillyTavern gives an entry's content block the same class as its header, so the card-header layout was applied to the content too. The text box was squeezed to a sliver and the checkboxes piled onto other fields. The card layout now only touches the real header. The opened entry's header is solid (it was see-through) and scrolls away instead of covering a third of the screen. Nested drawers such as Additional Matching Sources keep their own look. The four checkboxes sit in two columns under "Content (Tokens)". The Depth label hides together with its box when the position doesn't use depth.
- Picture viewer: with sharp pictures on, the chat avatar holds a small scaled copy, and the viewer opened that copy. It opens the original file again.

## 2.8.0

Chat:
- **Reply buttons**: Regenerate, Continue and Another version appear above the message box after a reply. They hide while you type, while a reply is being written, and when the last message is yours.
- **Drag to swipe**: drag the last reply sideways. It tilts with your finger and a hint says what letting go will do (another version to the left, the previous one to the right). A short drag springs back; scrolling up and down is not affected. SillyTavern's own swipe gesture is held back while this is on, so it never fires twice.
- **Search this chat** (More sheet): a search bar under the top bar finds text in every message, loading older messages when needed, with highlighted matches, a counter and older/newer arrows. Back closes it.
- **Context meter**: a thin line under the top bar shows how full the context was on the last reply (orange near the limit). Quick switch shows the exact token numbers.
- **Fold long messages**: older messages over about 2,500 characters fold with a fade and a Show more button.
- **New text pill**: while a reply streams in and you are scrolled up, the jump button says New text.
- **Chat look** (More → Themes): Cards (as before), Bubbles (your messages on the right) or Flat (no boxes).
- **Quick Replies** show as a single row of scrollable chips.

Lorebooks and presets:
- **Lorebook entry cards**: each entry is a card with its switch, title and keyword chips. Opening an entry gives it the whole page with its buttons in a sticky header; back closes it.
- **Triggers as chips** in the prompt editor, with a note when none are picked.
- **Slider steppers**: − and + buttons beside every slider number. The number box is wide enough for values like 1.00.
- **Bigger drag handles** for reordering prompts.

Fixes:
- SillyTavern's dry runs (used to count prompt tokens) no longer make Mobile UI think a reply is still being written.

## 2.7.1

- Animated pictures now come from SillyTavern's own picture picker: when the picked file is a GIF, an animated WebP or an animated PNG (detected from the file's bytes), the moving version is kept automatically, also for brand-new characters. Picking a still picture removes the animation. The separate Animated button is gone; card tools are back to two rows of four.

## 2.7.0

- Sharp pictures: SillyTavern's 96×144 thumbnails are replaced, for pictures on screen, by the original image scaled in the browser to the size the screen needs (200/400/640 px wide), three at a time, cached for the session. Applies to the character list and grid, favorites, character card, chat avatars, the top bar and personas. Switch: Sharp character pictures.
- Animated pictures: an Animated tool on the character card uploads a GIF/WebP/APNG to the user's files and stores its link in the character's extension data (the card PNG is not changed). Mobile UI shows it everywhere that character's picture appears, and the picture viewer opens it. Switch: Animated pictures.
- Card tools are now two even rows of five.

## 2.6.1

- Characters page decluttered: a single toolbar row (search, Sort sheet, Grid/List toggle, ＋ sheet with every SillyTavern and extension button by name plus Select several). The selected character's name and the list button are hidden on the list, favorites row hides when empty, filters are slim pills, and page controls move under the list and only appear with more than one page.
- Grid view: edge-to-edge 3:4 picture cards with the name on a gradient and a star for favorites (fixed SillyTavern's min-content card height collapsing rows). List view: borderless rows with round pictures.
- A–Z strip lines up exactly with the list.

## 2.6.0

- Characters list: search box always visible, tools and sort menu on one row, favorites strip with names, A–Z strip with a letter bubble (A–Z / Z–A order, 10+ entries), grid view as three picture cards per row. Fixed older grid rules that targeted the wrong element.
- Character card: 120px avatar with the name under it, the eight tools in a labeled 4×2 grid, and tabs for Description, First message, and Notes & tags (each text box gets the page height).
- Recent chats: search box (also finds chats folded under "show more"), Pinned and Recent headings, swipe right to pin/unpin and left to delete (SillyTavern still asks before deleting).
- Chat history: date headings (Today, Yesterday, This week, This month, then by month) that follow the search box.
- Search everything: characters, groups, recent chats (name and last message), lorebooks and settings in one sheet; from the 🔍 on the start screen or the search field at the top of More.
- New switches in Phone features: New character pages, Chat list helpers.

## 2.5.1

- Translate chat calls Google Translate directly from the browser and sends many messages per request (a small first batch so the screen updates at once, then 8,000-character batches, four at a time). A 60-message chat takes about a second; before, each message was a separate request through the SillyTavern server.
- Formatting survives translation: markdown bold/italics and line breaks are sent as tags Google keeps in place, code is not translated, HTML in messages is kept, and spaces around quotes and punctuation are tidied.
- "Translate new replies too" is handled by Mobile UI (new, edited and swiped messages, yours and the character's) using the same fast route. Other providers chosen in Chat Translation (DeepL and so on) still go through SillyTavern; if the direct route fails, it falls back to SillyTavern's route.

## 2.5.0

- Translate chat: a translate button in the chat's top bar (also under More) opens a language list with search and recent languages. The whole chat is translated with Google Translate through your SillyTavern server (no key needed), four messages at a time, newest first. Original text is kept; Show original brings it back. A switch translates new replies too.
- The Termux setup script fetches its icon from GitHub when run on its own.

## 2.4.1

- One-tap start on Android: `termux/setup.sh` adds a home-screen shortcut (Termux:Widget) that starts SillyTavern if needed and opens it, a Stop shortcut, and optional start when Termux opens or when the phone boots.

## 2.4.0

- Editing a message opens a full page: a big text box, the tools in one row, and Cancel and Save at the bottom. The back gesture saves your changes.
- Hold a message to open its menu (can be switched off in Phone features).
- A banner appears when SillyTavern stops answering, for example when Termux was closed, and goes away by itself when the server is back.
- Quick switch (⚡ in the top bar): change persona, connection profile, model or preset. Hold the avatar in the top bar to switch persona.
- Find a setting: the 🔍 on the Presets, API, Formatting, Settings and Extensions pages searches every option by name and jumps to it.
- Long chats scroll faster: messages far off screen are not drawn until needed.
- Install as an app (More → Install as an app) with its own home-screen icon.
- What's new appears once after each update, and any time from More.
- Mobile UI's own labels are translated into Spanish, Portuguese, Russian, Chinese, Japanese and Arabic (right-to-left), following SillyTavern's language.
- Automatic phone-mode tests run on GitHub for every change.

## 2.3.2

- The copy button in edit mode asks whether to copy the text or duplicate the message.

## 2.3.1

- Copy in the message menu works, also when SillyTavern is opened by a network address.

## 2.3.0

- Home button back to Recent chats.
- Full-screen picture viewer for chat avatars: pinch and double-tap zoom, rotate, open, save.
- Notifications as colored cards with icons; swipe one sideways to dismiss it.
- The stop button matches the send button.

## 2.2.0

- The prompt editor in Presets opens as a full page; the back arrow and back gesture close it.
- Send animation, redesigned Recent chats and Personas, and Phone features (message menu, jump to latest, drafts per chat, keep screen on, text size, vibration).
- Fixed message menus showing both buttons of a pair.

## 2.1.0

- 12 themes, a new icon set, and smooth animations with Light and Off options.

## 2.0.0

- App-style phone layout: top bar, bottom tabs, full-screen pages, bottom-sheet menus and popups, back gesture support.

## 1.0.0

- Phone-only touch layout with a searchable lorebook picker.
