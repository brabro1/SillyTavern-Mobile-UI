# Changelog

## 2.17.0

A desktop layout, so Pocket Tavern works on a computer too. Phones are unchanged.

- **How to get it:** on a computer, open **More → Pocket Tavern settings** (or Extensions → Pocket Tavern) and set "Use it on this device" to **Always on**. Pocket Tavern still stays off on computers unless you choose that. Any screen at least 960px wide and 560px tall gets the desktop layout, including a tablet held sideways; a phone held sideways keeps the phone layout.
- **Tabs as a rail.** Chat, Characters, Lorebooks, Presets and More sit in a slim rail on the left, with the same sliding highlight as on the phone.
- **Pages beside the chat.** A page opens as a panel next to the rail, not over the whole screen, and the chat moves over to make room. The panel stays open while you type and click in the chat (SillyTavern normally closes it), so you can change a preset or a setting and keep chatting. Back, tapping the tab again or **Escape** closes it, and Escape steps back out of a Settings section first. SillyTavern's pages that use two or three columns on a computer are one column in the panel.
- **The chat is a centred column** that follows SillyTavern's own **Chat width** setting (Settings → Look), at least 560px wide and never wider than the space beside the panel.
- **Menus and popups are dialogs** in the middle of the screen: More, Themes, Chat options, Tools, Quick switch, SillyTavern's popups and the chat history. The message editor fills the chat column; lorebook entries and the prompt editor fill the panel.
- **Hover.** Rows, tiles, tabs and buttons light up under the mouse.
- Toasts and the "server not answering" banner sit at the top right.
- The phone test now also checks the desktop layout.

## 2.16.0

A redesign of the settings and menus, so they feel like a phone app.

- **Settings in sections.** SillyTavern's Settings page was one long list of about a hundred options. It now opens on a short list, like a phone's own Settings app: **Look**, **Display**, **Chat**, **Characters**, **Sounds and more**, **Custom CSS** and **STscript**, each with a line on what is inside, plus **Pocket Tavern** for the phone layout. A section shows only its own options, the top bar shows its name, and back returns to the list. **Search settings** finds any option and opens the section it is in. Language, account and version sit under the list. Anything a newer SillyTavern or another extension adds lands in **Sounds and more**, so nothing gets lost.
- **Explanations under each setting.** SillyTavern explains most options in tooltips, which a phone never shows. Pocket Tavern shows that text as a line under the option, on Settings, Presets, API, Formatting and Extensions. Long ones show two lines; tap to read the rest (the tap does not flip the switch).
- **Switches on the right.** Every on/off option is a row: the name and its explanation on the left, the switch on the right, with a thin line between rows. "Avatars: Circle" style options are rows too, with the choice on the right, and sliders show their name and number on one line with the slider under them. Switches that are off now have a grey knob, so they are easy to see on light themes; switches that are on use the theme's accent.
- **Chat options (☰) as a sheet.** The menu is grouped into **Reply** (Regenerate, Continue, Impersonate), **This chat** (Author's Note, CFG, token probabilities, checkpoints, convert to group, and Delete messages last, in red) and **Chats** (start new, manage chat files, close). Each item has a line on what it does. Items other extensions add appear under **From extensions**. Like every sheet, it closes with a drag down or back.
- **Tools (the wand) as a sheet,** each tool with a line on what it does. **Generate Image** asks what to draw in a sheet of its own (the character, their face, you, the whole story, the last message, a background).
- **Extensions page:** a line under each built-in extension's name says what it does.
- The phone test checks the new Settings sections, the explanations, ☰ and the wand.

## 2.15.3

A test round before sharing the project: the phone test, a screen-by-screen check at three sizes and with the keyboard up, a slow-phone speed test, the light theme and Arabic (right to left).

- **Fixed: Search this chat from a page.** Opened from More while a page such as Extensions was showing, the search bar searched the chat behind that page. It now closes the page first, so you see the matches. Start a new chat does the same.
- **44px to tap everywhere.** SillyTavern's buttons were 42px tall in Pocket Tavern, and a few were smaller: your persona button in the message box, Close on sheets, and the buttons on the start screen (the Recent chats header, Docs/GitHub/Discord, pin/rename/delete on a recent chat). All are at least 44px now.

## 2.15.2

- **Fixed: squeezed message box while typing.** With the keyboard up, a portrait phone's view is wider than it is tall, so the sideways layout switched on: the message box went to one row and squeezed the text into a narrow column (and the bars got slimmer while typing). The sideways layout now also needs a clearly wide screen (3:2), which only a real sideways phone has.
- **Smooth hold-and-drag on sheets.** A slow drag stuttered because the background's dimming was restyled on every frame and the touch listener held up the browser's scrolling. The sheet now moves on its own layer with nothing else changing, the listeners never block scrolling, and Android's stretch effect is off inside sheets so pulling down at the top drags the sheet.
- **The keyboard, smoother.** The tab bar steps aside in the same frame the screen shrinks (one change instead of two jumps), the message box glides from where it was to its new place above the keyboard, and if you were at the newest message the chat stays there.
- **No scrollbars**, anywhere Pocket Tavern is on; everything still scrolls by touch.

## 2.15.1

- **Fixed: a tap on a reply went to the previous version.** 2.15.0 gave the swipe arrows a bigger invisible tap area, but the back arrow wasn't positioned, so that area stretched over the whole message. A tap anywhere on a reply with several versions pressed "back". The tap area now stays around the arrow (48×44px), and SillyTavern's old offsets for the arrow no longer shift it. The phone test checks this now.
- **Fixed: opening a chat could land mid-way.** SillyTavern scrolls to the newest message once, right after drawing the chat; then the messages settle (Faster long chats measures their real heights, long ones fold) and the chat ended up thousands of pixels above the newest message. For a moment after a chat opens, Pocket Tavern now keeps it at the newest message, until you scroll yourself. It respects SillyTavern's own "scroll chat to bottom" setting.
- **Smooth sheet dragging.** Sheets move once per frame on their own layer while you drag them, can be pulled down from their content (when it is scrolled to the top) as well as the top strip, the dimmed background lightens as you pull, and a quick flick closes them even when short. A drag that starts on a row doesn't also press it.
- **A soft shadow under the message box**, so it sits clearly above the chat. It is the one shadow in Pocket Tavern (DESIGN.md notes the exception).
- The phone test no longer leaves test versions in the test chat.

## 2.15.0

Design round, following the new [DESIGN.md](DESIGN.md) guide (written from an audit of the screenshots and a contrast check of every theme).

- **Accent only where it means something:** Send and Save, the active tab, current selections, toggles and sliders, the context ring. Row and tile icons, chips, lorebook keyword chips, the A–Z strip, the ⚡ button, rings around pictures, recent-chat badges and the persona card are neutral now. **Close** is plain text instead of an outlined button.
- **Themes with their own character.** Most themes were one recipe in another colour (a tinted dark background, two glows, a stock bright accent). Now each differs in structure: flat or one glow at most, different surface lightness, and accents tuned for the theme. **Paper** is fountain-pen blue on grey-white paper (it was cream and terracotta), **AMOLED** uses candle gold (it was acid teal), **Ember** glows from below like a hearth, **Ocean** is a lighter sea with light from above, and Forest, Sakura, Mocha, Lavender and Nord are flat. Midnight's buttons now pass the contrast check. All twelve themes pass: text 4.5:1, text on accent 4.5:1, accent 3:1. Theme names are unchanged, so your choice is kept.
- **Character card:** Delete is last and quiet (a red icon and label; the fill belongs to the confirm). Lore and Chat lore look like the other tiles, with a small dot when a lorebook is linked, instead of SillyTavern's green.
- **No generated-design tells:** no all-caps letter-spaced labels (Pinned, Recent, chat-history dates, badges), no middle-dot lists, no sparkle icon (the thinking box uses a lightbulb, Model a flask, Phone features a phone), and no drop shadows (things floating over the chat get a thin outline).
- **One scale:** corners use 12px, 16px or fully round; text uses 12, 14, 16 and 20px. The tiny 9–11px text is gone.
- **Easier to tap:** preset − and +, the swipe arrows, the message box tools, the context ring and the message buttons all have at least a 44px tap area. The ⋯ and ✎ on messages are easier to see.
- **Small things:** the message box border is neutral until you type; a reply with one version shows only the ⟳ button (no "1/1"); the context ring shows "46%"; the Presets hint lines up with the page; labelled checkboxes on settings pages are pill toggles; the More search says "Search everything"; More tiles only keep subtitles that add something.

## 2.14.3

Polish round: every screen was walked through on a normal phone, a small phone (360×640), sideways and with the keyboard up, checking for errors and anything spilling off the screen (`tests/audit.mjs` does this and saves a picture of each screen).

- **Sideways:** the message box goes back to one row (persona and tools, the text, the ring and Send), so a short sideways screen keeps room for the chat.
- **Start screen:** the round jump-to-latest button showed there and covered the buttons of an open Recent chats card. It now only shows in a chat.
- **Support:** Pocket Tavern has a [Ko-fi page](https://ko-fi.com/brabro). The README has a Support section and GitHub shows a Sponsor button.
- The phone test always puts the test persona back as it was, even when a step fails.

## 2.14.2

- **No keyboard when an edit opens.** Tapping ✎ (or Edit in the message menu, editing a message's thinking, opening a lorebook entry or a persona) made SillyTavern focus the text box, which popped up the keyboard. A text box in an edit area that takes focus because you tapped something else now stays closed; tap the text itself to type. SillyTavern's copy fallback still works.
- **A smoother keyboard.** The sheets' keyboard-height value was written on the page root on every frame while the keyboard slid in, which restyled the whole page each frame; it now goes on the open sheet only, once per frame, and nothing happens when no sheet is open. The tab bar steps aside the moment you tap a text box instead of jumping away halfway through the keyboard's slide, and screen-size changes are handled at most once per frame.
- **Smoother dropdowns.** Recent chats no longer grow open frame by frame (which re-laid out the whole list on every frame). A card now opens in one step while the cards below glide into place and the content fades in, using movement only, so it stays smooth on phones. Light animations make it quicker, Off turns it off.

## 2.14.1

- **No surprise keyboard.** SillyTavern focused the message box when a chat opened, which popped up the keyboard. For a moment after a chat opens (from Recent chats, the character list, chat history or search), the box now only takes focus when you tap it yourself.
- **Recent chats start at the top.** SillyTavern scrolled the start screen to its end after drawing it (and again after its welcome message), so the home button left you at the bottom. It now starts at the top, unless you already began scrolling.
- **The persona sheet stays open after switching.** Picking another persona switches right away and the sheet redraws with the new one on top, so you can switch again or edit it without reopening.

## 2.14.0

- **Recent chats as dropdowns.** Each character's card is now closed by default and shows the picture (with a badge for how many chats), the name, the date and the last thing said, in two lines. Tap the card for the latest chat; tap the arrow on the right to drop the list down smoothly. Inside are three quick actions, **New chat**, **All chats** (SillyTavern's chat list for that character) and **Character** (the character card), and then every recent chat with them on the thread line, each with pin, rename and delete. Open cards stay open while the app is open. Searching opens the cards that have a match.
- **The message box floats for real.** It now sits over the chat instead of below it, so messages scroll on behind and around it, with a soft fade near the bottom. The chat keeps room at its end for the last message, and stays at the newest message when the box grows while you type.
- **New swipe arrows.** Fixed: on some phones the back arrow sat higher than the counter and the next arrow (SillyTavern showed it as a plain block, so its icon stuck to the top). The arrows and the counter are now one pill, ‹ 1/3 ›, with round centered buttons. On the last version the next arrow turns into an accent-colored "new version" icon, because tapping it there writes a new reply.

## 2.13.0

- **Messages, redesigned for phones.** Each message is now a grid instead of SillyTavern's two columns. The text runs across the whole card instead of starting right of the picture. The header holds the picture (a bit smaller), the name with the date under it, and the ⋯ and ✎ buttons. The footer holds the message number, time and token count (when SillyTavern shows them) on the left and the swipe arrows with a small counter pill on the right. Messages that can't be swiped no longer keep an empty row for the hidden arrows. Cards sit closer to the screen edges. Works with Cards, Bubbles and Flat. The full-screen editor keeps SillyTavern's own layout while you edit.
- **The model's thinking** folds into a rounded box with a ✦ and "Thought for…". Tap to open it; the thoughts show in smaller, muted text with their own scroll, and the title breathes while the model is still thinking.
- **Recent chats grouped by character.** The start screen shows one card per character (or group chat): the picture, the name, how many chats and when you last chatted. Tap it to open the latest chat. Under it are that character's chats, newest first, joined by a thin thread line, each with its name, date, last line and the pin, rename and delete buttons; swiping a chat still pins or deletes it. After two chats, "Show N more" opens the rest. Pinned chats stay in their own section on top, and search goes through all chats and character names. SillyTavern's own rows are moved into the groups, so everything they do keeps working.
- **Edit your persona quickly.** Tapping your persona in the message box opens a "Your persona" sheet: your current persona as a card with an **Edit** button, the other personas to switch to, and a link to all persona settings. **Edit** opens a small editor for the name and description, with a live token count, and saves the same way SillyTavern's Personas page does.
- Fixed: searching recent chats could match chats SillyTavern had folded away and still leave them invisible.

## 2.12.0

- **A new message box.** One floating rounded box: the text gets the whole width on top, and the tools sit in a row along the bottom (your persona, SillyTavern's ☰ and ✨, any extension buttons, the context ring and Send). The square strip behind it is gone, and the typed-text hint starts on the left like your text.
- **Persona in the message box.** Your persona shows as a round picture with your name; tap it to switch persona. It follows persona changes, renames and new pictures. Holding the character's picture in the top bar no longer switches persona.
- **Context ring and Context page.** The thin line under the top bar is now a ring next to Send, with the percentage inside. It turns orange above 85% and red when full, and is dotted before the first reply. It fills as soon as a chat with replies opens. Tap it for the Context page:
  - how full the context is, in tokens and as a big ring;
  - what filled it, as one colored bar and a row per part: main prompt and instructions, character/persona/scenario (with description, personality, scenario and persona counts), example messages, lorebooks, chat history (with the number of messages), author's note, and the free space;
  - a plain-words note: how much room is left, or that the oldest messages are being left out;
  - the model, preset, connection, tokenizer, context size and the room kept for the reply;
  - **Show the full prompt** (SillyTavern's own prompt view) and **Change context size**.
  The numbers come from SillyTavern's record of the last reply, the same as its Prompt popup. Quick switch's "Context used" row opens the page too.
- **Reply buttons removed.** Regenerate, Continue and Another version above the message box are gone (and their switch in Phone features). Dragging the last reply sideways still swipes, and SillyTavern's ☰ menu still has Regenerate and Continue.
- The screenshot script gives the last test reply a sample prompt record so the ring and the Context page can be shown; the README has a new Context picture.

## 2.11.1

- **Smooth scrolling up in long chats.** With Faster long chats on, messages off screen are skipped and should keep their height. But the chat is a flex column, and the skipped messages shrank to almost nothing (24 px instead of, say, 725 px). Scrolling up, each one popped open to its real height and the browser had to move the chat to make up for it, dozens of times per scroll. That was the stutter and the back-and-forth. Messages no longer shrink, and right after a chat opens (or translates, folds or changes width) every message is drawn once for one frame, so the browser knows each real height. Measured: 48 height changes per scroll before, 0 now.
- **The Characters page opens on the list.** With a chat open, the page first slid in showing that character's card, then switched to the list, which SillyTavern rebuilt, and then the cards faded in one by one. Now it switches to the list before the page slides in, doesn't ask SillyTavern to rebuild a list that is already showing, and the cards no longer fade in one after another.
- **Sharp pictures without the flash.** When SillyTavern rebuilds a list, every spot that already had a sharp picture gets it back before the page is drawn. New sharp pictures made close together go in together.
- **Sheets slide up from the bottom.** The More menu and the other sheets now slide all the way up from the bottom edge (and back down when closed) instead of fading in 40 px lower. Opening focused the search box while the sheet was still below the screen, and the browser scrolled the sheet to it, so it came in from the top; that can't happen anymore. The tiles inside no longer fade in one by one.

## 2.11.0

Performance round. Measured on a phone-speed CPU (4× slower than a computer) in a 150-message chat, with `tests/perf.mjs`. Times are how long the screen was frozen:

| | Before | Now | Plain SillyTavern |
| --- | ---: | ---: | ---: |
| Typing a message | 646 ms | 0 ms | 0 ms |
| A reply streaming in | 290 ms | 32 ms | 23 ms |
| Scrolling the chat | 66 ms | 0 ms | 0 ms |
| Opening pages | 1416 ms | 182 ms | 446 ms |
| Opening More and Themes | 373 ms | 136 ms | – |
| Scrolling the character list | 1936 ms | 383 ms | 679 ms |

- **Sharp pictures no longer measure every picture.** After any scroll anywhere (even the message box scrolling while you type), every avatar on the page was measured, which woke up all the off-screen messages in a long chat. Now only the few pictures already known to be near the screen are checked, and scrolling inside text boxes is ignored.
- **New pictures go in together**, once per frame, instead of one by one, so the page restyles once.
- **The title slide in the top bar** no longer forces the whole page to lay out before it starts.
- **Sheets open lighter.** The keyboard-height helper used to add and remove page-wide values for every sheet, restyling the whole page twice; it now stays put and only writes when the number really changes.
- **The A–Z strip** is only rebuilt when the letters change, not every time SillyTavern redraws the list.
- **No live blur behind the bars.** The top bar, the tabs and the message box blurred the chat behind them on every scroll frame, the heaviest effect for a phone's graphics chip. They were already 88–92% solid; now they are 96–97% solid without blur and look almost the same.
- **The status bar color** is read after the first frame instead of in the middle of starting up.

## 2.10.1

- **− and + for every slider**: they only showed for Chat Completion presets. Text Completion, KoboldAI and NovelAI sliders keep their number in a different box, which now gets the buttons too.
- **Filter buttons in theme colors**: SillyTavern colors the Favorites, Groups, Folders and Tags buttons above the character list with fixed see-through colors and dims them. That was muddy and hard to see in the light themes. They now use the theme's colors: plain when off, the accent color when on and red when excluded.
- **The name fits in the top bar**: with six buttons in a chat, a name like "Seraphina" was cut to "Seraphi…" on small phones. The buttons are a little slimmer on screens up to 400 px wide.
- **New screenshots and banner**: every README picture is retaken (now sharper), including new ones for the Bubbles look and lorebook entry cards. `tests/screenshots.mjs` retakes them in one go.

## 2.10.0

- **New name: Pocket Tavern.** Mobile UI is now called Pocket Tavern, and the GitHub repository moved to [brabro1/SillyTavern-PocketTavern](https://github.com/brabro1/SillyTavern-PocketTavern). The old link keeps working, updates keep coming, and all your settings stay as they are.
- A new logo and home-screen icon: a chat bubble tucked into a pocket.
- The README is shorter and clearer, says plainly that the project is in alpha, and there are issue forms for bugs and ideas.

## 2.9.0

- **One-tap translate**: tapping the translate button in the top bar now translates the chat straight away into the language you used last, and tapping it again shows the original. Tapping while it is translating stops it. Hold the button to open the language list. A small tag on the button (like AR or JA) shows the language one tap gives. The first time, with no language picked yet, a tap opens the list.
- SillyTavern's own **Translate Chat** in the ✨ menu translated one message at a time. While Mobile UI is on, it does the same one-tap translate as the top-bar button. Translate Input is left as it is.

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
