/** Shown in More → What's new, and once after each update. Newest first. */
export const CHANGES = [
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
