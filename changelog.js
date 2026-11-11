/** Shown in More → What's new, and once after each update. Newest first. */
export const CHANGES = [
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
