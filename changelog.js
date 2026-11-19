/** Shown in More → What's new, and once after each update. Newest first. */
export const CHANGES = [
    {
        version: '2.19.2',
        items: [
            "Moonlit Echoes: pick one of its chat styles (Echo, Whisper, Hush, Ripple, Tide) under Settings → Look → Chat Style and it draws the messages, instead of clashing with Pocket Tavern's cards. The message box no longer looks greyed out, and the top bar and ☰ keep their size.",
            "Fixed: with Moonlit Echoes, the message editor's Save and Cancel were hidden at the bottom of the screen.",
            "ScenePulse: on a phone it opens from the wand (Tools). Its button next to Send squeezed the Send button, and its round floating button sat on top of Send. On a computer its side panel starts below the top bar.",
        ],
    },
    {
        version: '2.19.1',
        items: [
            "Opening and closing the keyboard is smoother: the chat and the message box slide together as one piece, and the tabs step aside at once instead of sliding over the box.",
            "Fixed: if a character's animated picture file was deleted, or the card came from someone else's SillyTavern, the chat showed a crossed-out person instead of the character. It now shows the normal picture.",
        ],
    },
    {
        version: '2.19.0',
        items: [
            "With Guided Generations installed, its row of icons becomes one guide button next to Send, with a menu that explains every action. Its guides, tools and popups fit the screen, and holding the button repeats your last guided action.",
            "iPhone and iPad: with the keyboard up, the bars, the chat and the message editor stay in the part of the screen you can see. On an iPad held sideways the chat is wider, and More → Themes has a Chat width slider.",
            "Fixed: in the Bubbles look the message editor shrank to its text and sat at the edge of the screen. It fills the page again.",
            "Fixed: the docked message box cut off the top of the text field. Your typing now follows the Chat text size.",
            "Input History's buttons sit at the end of the text field, and quick replies share one line on a phone held sideways.",
        ],
    },
    {
        version: '2.18.4',
        items: [
            "Fixed: editing a message could push the whole screen up, so the top bar and the message you were editing slid off the screen.",
            "Compact now also tightens the start screen: the version on one line, slim shortcut chips and smaller recent chat cards.",
        ],
    },
    {
        version: '2.18.3',
        items: [
            "Quick reply buttons are slimmer chips, and they wrap onto another line instead of sliding off the screen.",
            "With Guided Generations, its buttons stay on one line and the quick replies get the line under them, instead of squeezing in between and pushing buttons off the screen.",
        ],
    },
    {
        version: '2.18.2',
        items: [
            "Fixed: with Guided Generations (or a theme that restyles the message box), the text was squeezed into a narrow strip beside the buttons. It always gets its own row now.",
            "Guided Generations' buttons in the message box look and tap like Pocket Tavern's own (44px, no borders).",
        ],
    },
    {
        version: '2.18.1',
        items: [
            "The docked message box is redone like a messaging app: your persona, the text field and Send in one row at the bottom, with the other tools in a row above.",
            "Send stays level with the field as your message grows, and the bar has room above the bottom edge.",
        ],
    },
    {
        version: '2.18.0',
        items: [
            "In a chat the bottom tabs tuck away, so they are not right under the message box. Tap the arrow in the message box to bring them back.",
            "New Size option (More → Themes): Compact has slimmer bars and tighter cards, so more of the chat fits. Automatic picks it on small phones.",
            "New Message box option: Docked sits flat along the bottom edge, like a messaging app.",
            "Pocket Tavern now switches on by itself on computers too, with the desktop layout. Prefer the original there? Pick Phones only.",
            "Fixed: the Characters page hid its page buttons, so with many characters you could not see the rest.",
        ],
    },
    {
        version: '2.17.0',
        items: [
            "New: a desktop layout. On a computer the tabs become a rail on the left, pages open beside the chat, and menus are dialogs.",
            "On a computer a page stays open while you chat, so you can change a preset or a setting and keep going. Back, the tab again or Escape closes it.",
            "Phones are unchanged.",
        ],
    },
    {
        version: '2.16.0',
        items: [
            "Settings opens on a short list of sections (Look, Display, Chat, Characters and more), each with a line on what is inside.",
            "Every switch sits on the right, with a line under it on what it does. Tap a long explanation to read all of it.",
            "The ☰ menu is a sheet grouped into Reply, This chat and Chats, and the wand opens Tools. Each item says what it does.",
            "Presets, API, Formatting and Extensions show the same explanations, and switches that are off are easier to see on light themes.",
        ],
    },
    {
        version: '2.15.3',
        items: [
            "Fixed: Search this chat, opened from More while a page was showing, searched behind that page. It now goes to the chat first.",
            "Every button is at least 44px to tap, including your persona button, Close and the start screen buttons.",
        ],
    },
    {
        version: '2.15.2',
        items: [
            "Fixed: with the keyboard up, the message box squeezed your text into a narrow column.",
            "Holding and dragging a sheet is smooth now, not only a quick swipe.",
            "The message box glides up with the keyboard, and the chat stays at the newest message.",
            "No scrollbars anywhere, like a phone app.",
        ],
    },
    {
        version: '2.15.1',
        items: [
            "Fixed: tapping anywhere on a reply with several versions went back to the previous version.",
            "Fixed: opening a chat sometimes left you in the middle instead of at the newest message.",
            "Sheets drag down smoothly, also from their content, and a quick flick closes them.",
            "The message box has a soft shadow, so it sits clearly above the chat.",
        ],
    },
    {
        version: '2.15.0',
        items: [
            "A calmer, more deliberate look: the accent colour only marks what matters, Close is plain text, and there are no more shadows or all-caps labels.",
            "The themes are redone so each has its own character. Paper is now ink blue on paper, AMOLED uses candle gold.",
            "The character card's Delete button is quiet and last; Lore and Chat lore lost SillyTavern's green.",
            "Bigger tap areas for small buttons, easier-to-read small text, and a reply with one version no longer shows 1/1.",
        ],
    },
    {
        version: '2.14.3',
        items: [
            "Sideways, the message box is one compact row, so the chat keeps its room.",
            "The jump-to-latest button no longer shows on the start screen, where it covered the chat list.",
            "Pocket Tavern now has a Ko-fi page, if you'd like to support it.",
        ],
    },
    {
        version: '2.14.2',
        items: [
            "Opening an edit (a message, its thinking, a lorebook entry, a persona) no longer pops up the keyboard; tap the text to type.",
            "The keyboard comes up more smoothly: the tab bar steps aside right away and the page no longer redraws on every frame of it.",
            "Recent chat dropdowns open and close smoothly, with the cards below gliding into place.",
        ],
    },
    {
        version: '2.14.1',
        items: [
            "Opening a chat no longer pops up the keyboard; it opens when you tap the message box.",
            "The home button takes you to the top of Recent chats instead of the bottom.",
            "Switching persona keeps the persona sheet open, so you see the change and can switch again.",
        ],
    },
    {
        version: '2.14.0',
        items: [
            "Recent chats are dropdowns: tap a character for the latest chat, or the arrow for New chat, All chats, Character and all your chats with them.",
            "The message box truly floats: messages scroll on behind it.",
            "New swipe arrows: one ‹ 1/3 › pill, and on the last version the arrow becomes a \"new version\" button.",
        ],
    },
    {
        version: '2.13.0',
        items: [
            "Messages are redesigned for phones: the text runs across the whole card, with the picture, name and date in a small header.",
            "The model's thinking now folds into a neat box you can open, and swipes sit in a quiet footer.",
            "Recent chats are grouped by character: one card per character with your chats with them inside.",
            "Tap your persona in the message box and then Edit to change its name and description right there.",
        ],
    },
    {
        version: '2.12.0',
        items: [
            "A new message box: one floating box with your text on top and the tools in a row underneath, without the square strip behind it.",
            "Your persona is in the message box: tap your picture to switch who you are.",
            "The context meter is now a ring in the message box. Tap it for the Context page: what filled the context, how much room is left, and the full prompt.",
            "The Regenerate, Continue and Another version buttons are gone. Dragging the last reply still swipes.",
        ],
    },
    {
        version: '2.11.1',
        items: [
            "Scrolling up in a chat no longer stutters or pulls you back and forth.",
            "The Characters page opens straight on the list in one smooth move, without flashing.",
            "Menus like More slide up from the bottom of the screen and no longer flash while opening.",
        ],
    },
    {
        version: '2.11.0',
        items: [
            "Faster and smoother everywhere: typing, scrolling, replies coming in, opening pages and menus all do much less work, so your phone stays cool and responsive.",
            "The top bar, tabs and message box are now nearly solid instead of blurring the chat behind them, which was the heaviest effect for phones. They look almost the same.",
        ],
    },
    {
        version: '2.10.1',
        items: [
            "The − and + buttons now sit beside every slider, also for Text Completion and KoboldAI presets.",
            "The filter buttons above the character list use your theme's colors, so they are easy to see in light themes too.",
            "On small phones the character's name fits in the top bar again.",
        ],
    },
    {
        version: '2.10.0',
        items: [
            "Mobile UI has a new name: Pocket Tavern. Same extension, same settings, nothing to do.",
            "A new logo and home-screen icon.",
        ],
    },
    {
        version: '2.9.0',
        items: [
            "One-tap translate: tap the translate button to show the chat in your language, tap again for the original. Hold it to pick another language. A small tag on the button shows which language.",
            "SillyTavern's own Translate Chat in the ✨ menu now does the same fast one-tap translate.",
        ],
    },
    {
        version: '2.8.1',
        items: [
            "Opened lorebook entries are fixed: the text box is full width again, nothing overlaps, and the checkboxes sit neatly in two columns.",
            "The picture viewer shows the full-quality picture again instead of a small blurry copy.",
        ],
    },
    {
        version: '2.8.0',
        items: [
            "Reply buttons: Regenerate, Continue and Another version sit right above the message box after each reply.",
            "Drag the last reply left for another version, or right to go back. It follows your finger and tells you what will happen.",
            "Search inside the chat (More, then Search this chat). Matches light up and the arrows jump between them, even into older messages.",
            "A thin line under the top bar shows how full the context was. Quick switch shows the exact numbers.",
            "Very long older messages fold up with a Show more button. While a reply streams in and you have scrolled up, a New text button takes you down.",
            "Pick how the chat looks under More, then Themes: Cards, Bubbles or Flat. Quick Replies show as a row of chips.",
            "Lorebook entries are tidy cards with an on/off switch and their keywords as chips. Opening one fills the page, and back closes it.",
            "Presets: prompt Triggers are chips you tap, sliders have − and + buttons, and the handles for reordering prompts are bigger.",
        ],
    },
    {
        version: '2.7.1',
        items: [
            "Animated pictures need no extra button: pick a GIF or animated WebP the usual way (tap the character's picture) and it moves everywhere. Pick a normal picture to go back.",
        ],
    },
    {
        version: '2.7.0',
        items: [
            "Sharp character pictures: lists, cards and chats show the full-quality picture (scaled for your screen) instead of SillyTavern's small blurry thumbnail.",
            'Animated pictures: give a character a GIF or animated WebP (Animated on the character card). It plays in the list, the chat and the top bar.',
        ],
    },
    {
        version: '2.6.1',
        items: [
            'A cleaner Characters page: one row with search, Sort, Grid/List and a ＋ button (new character, import, new group, select several). The page controls only show when you have more than one page.',
            'Grid view shows full picture cards with the name on a soft fade and a star on favorites. List view is a calm contacts-style list.',
        ],
    },
    {
        version: '2.6.0',
        items: [
            'Characters: the search box is always there, favorites show their names, and an A–Z strip on the right jumps through the list. Grid view shows big picture cards.',
            'Character cards: a big picture and name, labeled tools (Favorite, Lore, Export…) and tabs for Description, First message and Notes & tags.',
            'Recent chats: search them, pinned chats get their own section, swipe a chat right to pin it or left to delete it.',
            'Chat history is grouped by date: Today, Yesterday, This week and by month.',
            'Search everything: one search for characters, chats, lorebooks and settings (🔍 on the start screen, or the search bar at the top of More).',
        ],
    },
    {
        version: '2.5.1',
        items: [
            'Translate chat is much faster: messages go straight from your phone to Google Translate in large batches, so a long chat takes about a second instead of one second per message.',
            'More accurate translations: bold, italics, paragraphs and line breaks are kept, code is left untranslated, and spacing around quotes stays right.',
            'New, edited and swiped messages are translated the same fast way when "Translate new replies too" is on.',
        ],
    },
    {
        version: '2.5.0',
        items: [
            'Translate chat: tap the translate button at the top of a chat and pick any of over 100 languages. The whole chat is shown in that language within seconds, newest messages first. The original text is kept, and Show original brings it back.',
            'Optionally translate every new reply as it arrives.',
        ],
    },
    {
        version: '2.4.1',
        items: [
            'Start SillyTavern with one tap on Android: a one-time Termux setup adds a home-screen shortcut that starts SillyTavern and opens it. See the README.',
        ],
    },
    {
        version: '2.4.0',
        items: [
            'Editing a message opens a full page with a big text box, and Save and Cancel at the bottom. Back saves your changes.',
            'Hold a message to open its menu.',
            'A banner tells you when SillyTavern stops answering (for example when Termux was closed) and reconnects by itself.',
            'Quick switch (⚡ in the top bar): change persona, connection profile, model or preset in two taps. Hold the avatar to switch persona.',
            'Find a setting: the 🔍 on settings pages searches every option by name.',
            'Long chats scroll faster.',
            'Install as an app from More, with its own home-screen icon.',
            'Mobile UI speaks more languages: Spanish, Portuguese, Russian, Chinese, Japanese and Arabic.',
        ],
    },
    {
        version: '2.3.2',
        items: ['The copy button in edit mode asks whether to copy the text or duplicate the message.'],
    },
    {
        version: '2.3.1',
        items: ['Copy in the message menu works, also when SillyTavern is opened by a network address.'],
    },
    {
        version: '2.3.0',
        items: [
            'Home button back to Recent chats.',
            'Full-screen picture viewer for avatars with pinch zoom.',
            'Notifications as colored cards; swipe to dismiss.',
            'The stop button matches the send button.',
        ],
    },
    {
        version: '2.2.0',
        items: [
            'The prompt editor in Presets opens as a full page and the back arrow closes it.',
            'Send animation, new Recent chats and Personas, and Phone features.',
        ],
    },
];

export const VERSION = CHANGES[0].version;
