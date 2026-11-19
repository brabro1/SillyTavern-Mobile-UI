# Changelog

## 2.21.0

A second desktop round from the same Firefox user's report, checked screen by screen, and personas that look like your characters. Two fixes (long lorebooks, the Cancel button) also help on a phone.

### Desktop

- **Tool panels beside the chat.** Author's Note, CFG, Token probabilities and the pop-outs of extensions (Summarize, the gallery, group members) are floating panels in SillyTavern. On a computer Pocket Tavern left them where SillyTavern puts them: the top-left corner, under the top bar and the rail, mostly hidden. They now open in a column on the right, the chat moves over to make room, and two or more share the column one above the other. Maximized, one covers the chat column. Escape closes the newest one. With SillyTavern's MovingUI on, they stay where you put them.
- **Fixed: picking a character on a computer.** Clicking someone in the Characters list showed their card for a moment and then closed the page (on a phone it closes so you land in the chat). On a computer the chat is already beside the page, so the page stays and shows their card.
- **Advanced definitions on a computer.** Its text boxes ran the full width of the screen. The content is now a readable column in the middle, with a 44px close button.
- **Chat history.** On a computer it is as tall as its chats instead of always nearly the full screen, stays in the middle, and its names, dates and previews are readable sizes.
- **Desktop words.** On a computer, More shows **Features** instead of Phone features, the Themes sheet says it changes how Pocket Tavern looks, and the Settings page calls its section "Desktop layout, helpers and themes".
- **Ctrl+K** (⌘K on a Mac) opens Search everything on a computer when you are not typing; More shows the shortcut.

### Phone

- **Install as an app on iPhone and iPad.** More → Install as an app showed Chrome-on-Android steps on every device. It now shows Safari's steps (Share → Add to Home Screen) on iPhone and iPad, and the browser's install steps on a computer.

### Both

- **Two layouts, one core.** From this version on, Pocket Tavern on phones (Android, iPhone, iPad held upright) and Pocket Tavern on desktop (computers, tablets held sideways) are designed as two layouts on one shared core: the same themes, settings and features underneath, with each layout's own navigation, pages and menus. Every change now says which layout it is for, and iPhone and iPad are checked like Android with every phone change. The README, design guide and bug form say so too.
- **Personas like Characters.** In grid view the personas are picture cards like your characters, the one you use has an accent ring and your default one wears a crown. In list view they are quiet rows like the Characters list. The persona you use is a card: a big picture, its name, and its tools in an even grid with labels (Rename, Sync name, Lore, Picture, Duplicate, Delete), then the More menu. Delete is quiet like a character card's, and a linked lorebook is a small dot on Lore instead of green. Create is the accent + of the Characters list. On a computer with the page dragged wider, the list and the card sit side by side without tabs. (Follows the **New character pages** switch.)
- **Fixed: long lorebooks were cut off.** A lorebook showed three or four entries and the rest could not be reached, even with 25 on a page. An old rule from when SillyTavern's lorebook editor was a separate popup gave it the screen's height and hid everything below that; in SillyTavern 1.19 the editor sits inside the Lorebooks page. The page now scrolls through every entry, on a computer and on a phone.
- **Fixed: the Notes & tags tab grew.** On a character card, Notes & tags made the tab bar about 200px tall, because the tabs took the room the Description box takes on the other tabs.
- **Token Counter.** It opened as a screen-sized popup with plain labels. It is now a dialog as tall as what it holds (720px wide on a computer), with a real text box, the count in big numbers, the tokens as chips on a card and the IDs in a quiet monospace box.
- **Backgrounds.** Auto-select, New folder and Add background are 44px icons (with their names as tooltips); their text overflowed the buttons. On small thumbnails (zoomed out with −), the name steps aside for the hover tools instead of sitting under them.
- **Smaller things.** The delete skull in chat history no longer spins and glows while the mouse is over it; it turns the danger colour. Cancel in the message editor is a plain button next to Save instead of a red one. Pocket Tavern's own buttons show an accent ring when you move to them with the keyboard.
- **Reload after updates.** After SillyTavern updates Pocket Tavern, the page now reloads by itself, so the new version is running without a manual reload. It waits while the extension list or another dialog is open (Update all may still be updating other extensions), while a reply is being written, and while you edit a message or a prompt; unsent messages are kept. It starts with the update after this one, because the version that does the reloading has to be installed first. Switch it off under **More → Phone features → Reload after updates** (Features on a computer).
- **README and banner.** The README is shorter and grouped (phone, computer, chatting, characters, look, extras), with a "Where to find things" table. The banner now shows a laptop with the desktop layout next to a phone.
- `tests/phone.mjs` checks a long lorebook (it makes and deletes its own), the card's tabs, docked tool panels, the Token Counter's height, character picking, persona labels and side by side, the Backgrounds buttons and the desktop wording.

## 2.20.0

A fuller desktop layout, a full-screen prompt editor, and fixes from a Firefox user on a computer. On a phone, the prompt editor gets the same full-screen button and the same question before unsaved changes are lost; nothing else changes there.

- **Every page on the rail.** On a computer the rail on the left had Chat, Characters, Lorebooks, Presets and More, and the rest of SillyTavern (API, Personas, Formatting, Settings, Backgrounds, Extensions) was two clicks away inside More. They are now on the rail too, under a thin line, with More at the bottom. On a shorter window the rail's buttons get shorter and those six show only their icon (hover for the name); on a laptop with about 620px of browser window, More still fits without scrolling. More no longer repeats them. Clicking Settings again while a section is open goes back to the list of sections.
- **Pages can be made wider.** Drag the right edge of the open page (a line shows on hover) to make it wider, from 360px up to whatever still leaves the chat 480px. The width is remembered in this browser. Double-click the edge to reset it; with the keyboard, focus the edge and use the arrow keys. Lorebook entries and the prompt editor follow the same width.
- **Full-screen prompt editor.** A new button next to Save gives the prompt text the whole editor: name, role and position step aside, and on a computer the editor takes everything right of the rail. Press it again, Escape or Back to leave full screen.
- **No more lost prompt edits.** Leaving the prompt editor with unsaved changes, by another tab, Back or Escape, now asks: **Save**, **Keep editing** or **Discard changes**. Without changes it just closes.
- **Fixed: the prompt editor stopped short of the bottom on a computer.** SillyTavern stops its panels 50px above the bottom of the screen to leave room for its message box. Pocket Tavern's editor is a full page and didn't undo that, so the prompt list showed through under Save. It also kept SillyTavern's 450px minimum, so it was wider than the page beside it. Both are fixed.
- **Fixed: the prompt editor stayed open over the next page.** Switching tabs while editing a prompt left the editor on top of Characters or Lorebooks, on a computer and on a phone. It now closes (or asks, see above). On a computer, Escape leaves it too.
- **Fixed: numbers hidden behind arrows in Firefox.** Firefox always shows its own up and down arrows in number boxes, and next to − and + they covered the number (a context size of 32768 read as "327"). The arrows are gone wherever − and + are, and the box has room for seven digits.
- **Fixed: a second Triggers box on a computer.** SillyTavern's own Triggers box showed under Pocket Tavern's trigger chips in the prompt editor.
- **The Extensions page is one column** in the page beside the chat, instead of two narrow ones.
- **Chat Completion Tabs.** This extension puts Parameters and Prompts on two tabs at the top of the Presets page. Its tabs now look like Pocket Tavern's (44px, the active one highlighted, no lift on hover) and stay solid when they stick to the top. Find a setting switches to the tab that holds what you picked.
- `tests/phone.mjs` checks the rail, the panel's edge, the editor's height, full screen, the unsaved-changes question and the number boxes, with a stand-in for Chat Completion Tabs.

## 2.19.2

Moonlit Echoes and ScenePulse, checked on a phone. Nothing changes unless you use them.

- **Moonlit Echoes' chat styles.** Moonlit adds five chat styles to SillyTavern: Echo, Whisper, Hush, Ripple and Tide (its Glimmer theme turns on Echo). Pocket Tavern's message cards stayed on top of them, so you got a huge picture inside your own messages and names cut off like "Sera…". When one of them is picked under **More → Settings → Look → Chat Style**, Pocket Tavern's cards now step aside and Moonlit draws the messages, as they already did for SillyTavern's own Bubbles and Document styles. Pick Flat to get Pocket Tavern's cards and looks back.
- **Fixed: the editor's Save and Cancel were hidden with Moonlit Echoes.** Moonlit fades the top and bottom edges of the chat. The full-screen editor lives inside the chat, so its buttons at the bottom faded away with it and the message box showed through. While you edit, the fade is off. In Moonlit's chat styles the editor also lost room to the space they keep for a big picture; it fills the page again.
- **The message box stays clear.** Moonlit shows the box at 60% until the mouse is over it or you type in it. A phone has no mouse, so it looked greyed out. It's fully visible now.
- **The top bar and ☰ keep their size.** Moonlit sets the top bar's height on phones, which made Pocket Tavern's bar shorter and left no room for a notch, and it shrank ☰ to about 15px. Both are back to their own size (☰ is 44px to tap). The tabs arrow also stays hidden on a computer and while the keyboard is up.
- **ScenePulse opens from the wand on a phone.** ScenePulse adds a button next to Send. That row has no room for another button, so Send got squeezed (to 35px wide on a common phone, 18px on a small one). It also adds a round floating button that sat right on top of Send. On a phone both are hidden, and ScenePulse is in the wand's **Tools** list. Its full-screen panel covers Pocket Tavern's tabs, and on a computer its side panel starts below the top bar so its own toolbar shows.
- `tests/phone.mjs` checks all of this with stand-ins for both extensions, so it runs without them installed.

## 2.19.1

A smoother keyboard, and a fix for character pictures in the chat.

- **The keyboard, smoother.** When the keyboard opened, the chat jumped up in one go while the message box slid up on its own a moment later, so a gap opened between the newest message and the box (and closing, the box slid over the messages). Now the chat and the box slide together as one piece, in the same quarter second, and the newest message stays right above the box the whole way. Tabs that were showing step aside at once instead of sliding down over the box, and they no longer move once when you tap the box and again when the keyboard arrives. With motion turned off (More → Themes, or your phone's reduce-motion setting), everything moves in one step.
- **Fixed: a crossed-out person instead of the character's picture.** Pocket Tavern can show an animated picture for a character, kept as a link in the character card. When that file no longer existed (deleted, or the card was made on someone else's SillyTavern and shared), the picture failed to load and SillyTavern replaced it with its "missing picture" icon on every message until the chat was reopened. Pocket Tavern now catches that and shows the character's normal picture; the same goes for the sharper copies it makes of small pictures. To use an animated picture again, pick it once more from the character's page.

## 2.19.0

Guided Generations and Input History, made for a phone. Everything here only happens when those extensions are installed; without them nothing changes.

- **Guided Generations as one guide button.** Its row of icons (a bookmark, a book with a counter, a person, fast-forward, a dog) took a whole line above the message box and said nothing about what each one does. With it installed, that row is folded into one guide button right next to Send, because a guided action is another way to send. The button shows how many persistent guides are active.
- **A menu that explains itself.** The guide button opens a sheet. On top is the instruction you typed (tap it to keep editing), or, with nothing typed, a line on how guided actions work. Then every action Guided Generations shows, by name with a line on what it does: **Steer the reply** (Guided response, Guided swipe, Guided continue) and **Your message** (write my message as "I", "you" or "they"). Below are **Persistent guides** (with how many are active), **Tools**, and a shortcut to its settings. Which actions appear is still decided by Guided Generations' own settings.
- **Hold to repeat.** Holding the guide button runs your last guided action again, for example another guided swipe, without opening the menu.
- **Its menus as sheets.** Persistent guides and Tools opened as small pop-up lists above their buttons, which ran off the top of the screen on a phone and had no descriptions. They now open as sheets with every item, its group and Guided Generations' own description.
- **Its popups fit the phone.** Stat Tracker, Fun prompts, Edit Intros, Edit Guides and Corrections open as a bottom sheet above Pocket Tavern's bars (a dialog on a computer), with a 44px close button and 44px controls. Edit Intros' choices that only showed on mouse hover are shown as chips. The back gesture and Escape close them.
- **Prefer its own row?** Turn off **Guided Generations button** under More → Phone features (it only shows when Guided Generations is installed). Its row comes back, and its two menus then open in the middle of the screen with 44px rows.
- **Input History's buttons in the text field.** Its ↑ ↓ and history buttons were pushed onto a line of their own under the message box (and got huge). They now sit at the end of the text field. While you type your own words only the history button shows; on an empty box, or after the arrows brought back an earlier message, the arrows show too. Its history list has readable text and 44px rows.
- **Quick replies on a phone held sideways** share one line that scrolls sideways, instead of stacking a row per set while the keyboard leaves little room.
- **Fixed: the docked text field's top edge was cut off.** SillyTavern clips the top 5px of the message box to draw a progress line for slash-command scripts on its top border. Pocket Tavern never shows that border, so the clip only cut off the docked field's rounded top edge (and, in the floating box, the top of your text when a long message scrolled inside it). The clip is gone.
- **The docked field shows clearly where your typing goes:** a full accent edge while it has focus.
- **Your typing follows the Chat text size.** With Large or Extra large text, what you type in the message box is bigger too (never smaller than 16px).
- **The tabs arrow steps aside while the keyboard is up,** since the tabs cannot show then; the tools get the room.
- **Fixed: the message editor in the Bubbles look.** Bubbles puts your messages on the right and the AI's on the left. Newer versions of Chrome and Safari apply that alignment to the full-screen editor too, so it shrank to the size of its text and sat at the bottom or top edge of the screen, which could look like the message you wanted to edit had vanished. The editor fills the page in every look again.
- **iPhone and iPad.** Android shrinks the page when the keyboard opens (SillyTavern asks it to); Safari does not: the keyboard covers the bottom and Safari pans the part you can see. With the keyboard up, Pocket Tavern now sizes the top bar, the chat, the message box, pages, lorebook entries and the message editor to the visible part of the screen, so they no longer slide out of view. SillyTavern's transform on the page (a fix for flicker in Chrome) is turned off on iPhone and iPad, so the bars are fixed to the screen, not the page.
- **Wider chat on an iPad held sideways.** In the desktop layout a touch screen gets a chat column of at least 720px instead of half the screen. **More → Themes → Chat width** (shown on wide screens) makes it wider or narrower right away; it is SillyTavern's own Chat width setting.
- **Folding, unfolding or turning the device** picks sizes that depend on the screen (like Automatic size) again.
- The message box's height is now measured outside the browser's size notifications, which Safari reported as a "ResizeObserver loop" warning.
- `tests/ios.mjs` checks iPhone and iPad sizes and fakes Safari's keyboard to check that the bars, chat and editor follow the visible part, in Chrome or (with `ENGINE=webkit`) in WebKit, Safari's engine. The main screens were also checked in WebKit as an iPhone. The phone test checks the editor in all three chat looks.
- `tests/compat.mjs` walks through every Guided Generations action, menu and popup, and Input History, in a SillyTavern that has them installed. The phone test checks the guide button, its sheet, hold to repeat and Input History's place with stand-ins, so it also runs on GitHub.

## 2.18.4

A fix for the message editor, and Compact for the start screen.

- **Fixed: the message you were editing slid off the screen.** Since 2.18.0 the tabs slide away in a chat. They were left just below the screen, which made the page taller than the screen. When the editor opened, the browser scrolled that extra space into view and dragged the whole layout up: the top bar disappeared and the message being edited moved partly or fully off the screen. The tabs are now taken out of the page once they have slid away, and if anything scrolls the page anyway, Pocket Tavern puts it back (not on iPhones, where Safari scrolls the page on purpose for the keyboard).
- **Compact start screen.** With the Compact size, SillyTavern's version sits on one line next to a smaller logo, the shortcut buttons (Docs, GitHub, Discord, Temporary Chat) are slim chips, the title is smaller, and recent chat cards are tighter with a one-line preview. Every button still has a 44px tap area.
- The README is rewritten for everything Pocket Tavern does now, with a FAQ for the questions people asked.
- The phone test opens the editor on the last message with the tabs tucked away and checks that the page never scrolls.

## 2.18.3

Quick replies and Guided Generations, checked with the real extension installed this time.

- **Slimmer quick reply buttons.** They were 44px pills with a border. They are now 32px chips with no border and less padding (even less in Compact), and each one still has a 44px tap area, because its row is 44px tall and the tap area fills it. On a 360px phone, seven short buttons now fit on one line.
- **Nothing slides off the screen.** Quick replies used to scroll sideways in one line, so the last ones were hidden past the edge. They now wrap onto another line when they don't fit.
- **Guided Generations with quick replies inside its row.** Guided Generations can take the quick reply bar into the middle of its own button row. There they squeezed between its buttons and pushed the ones on the right off the screen. Its own buttons now stay on one line (menus at the start, actions at the end), and the quick replies get the full line under them, as in SillyTavern without Pocket Tavern.

## 2.18.2

A compatibility patch for extensions and themes that change the message box.

- **Fixed: the text squeezed into a narrow strip.** Guided Generations adds a row of buttons inside the message box, and some themes stop the box from wrapping onto a new line. Together they put the buttons and the text side by side, leaving the text a narrow strip next to them. Pocket Tavern now pins its message box layout (wrapping, the text row and the tool row), so the text always gets its own full-width row, whatever other CSS says. Anything an extension puts straight into the box gets a row of its own too.
- **Guided Generations' buttons** look and tap like Pocket Tavern's own tools: 44px, no borders, muted icons, and the row scrolls sideways if it has more buttons than fit.
- The phone test adds a Guided Generations-style row and a theme that rearranges the box, and checks that the text keeps its own row.

## 2.18.1

The **Docked** message box, redone. In 2.18.0 it was the floating box flattened: the field on top, every tool and Send in a row under it, pressed against the bottom edge, and Send far from the text.

- **One row at the bottom, like a messaging app:** your persona's picture, the text field, and Send right beside it. The field and Send are where your thumb is, and Send stays level with the bottom of the field as your message grows.
- **The other tools in a row above:** the tabs arrow, ☰, the wand, anything extensions add, and the context ring.
- The bar has 8px of room above the bottom edge, a clear line between it and the chat, and the same surface as the tab bar, so with the tabs out they read as one bottom bar.
- A phone held sideways keeps a single row. The desktop layout uses the same docked bar in the chat column.
- The phone test checks that persona, field and Send share the bottom row and that Send is clear of the edge.

## 2.18.0

Fixes and changes from the first round of feedback on Reddit.

- **Fixed: the Characters page hid its page buttons.** With more characters than fit on one page (50 by default), there was no way to see the rest. SillyTavern shows no page numbers there, only ‹ ›, and Pocket Tavern counted the numbers, found none and hid the buttons. The buttons now show whenever there is more than one page, and they are 44px to tap. On a narrow phone the list keeps ‹ › and drops « ». Page buttons on the Personas and lorebook pages are 44px too.
- **The tabs tuck away in a chat.** The bottom tabs sat right under the message box, so it was easy to hit them when you meant to start typing. In a chat they now slide away and the chat gets the room. An arrow at the start of the message box's tool row brings them back, and they tuck away again when you start typing, scroll the chat, or tap Chat. Pages, the start screen and the desktop layout always show the tabs. Switch it off with **Hide tabs in a chat** under More → Phone features.
- **Size: Automatic, Comfortable or Compact** (More → Themes, and in Pocket Tavern's settings). Compact has a slimmer top bar and tabs, smaller pictures and names in the message header, less space around and inside each message card, and a slimmer message box. Every button still has a 44px tap area. Automatic picks Compact on phones narrower than 380px (most 360px Androids and foldable cover screens) and Comfortable on the rest.
- **Message box: Floating or Docked.** Floating is the box you know. Docked sits flat along the bottom edge, full width, like a messaging app, with your text in its own field. Your persona button is in both.
- **Automatic now means phones and computers.** Pocket Tavern switches on by itself on any device: phones get the phone layout, and screens at least 960 × 560px get the desktop layout. The first time it turns on by itself on a computer or tablet, a short note says so and offers **Use it on phones only**. "Use it on this device" now offers **Automatic: phones and computers**, **Phones only** and **Off on this device**. If you had picked Always on, that is Automatic now and nothing changes for you.
- **Tablets and unfolded foldables:** messages and the message box are a centred column up to 720px wide, so lines stay easy to read instead of running across the whole screen.
- Fixed: SillyTavern capped the chat's height for its own message box, which left a gap under the chat when the tabs were hidden.
- The phone test checks the page buttons, the tucked tabs, Compact with Docked, and that the desktop layout turns on by itself.

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
