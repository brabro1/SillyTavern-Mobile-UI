#!/data/data/com.termux/files/usr/bin/bash
# One-time setup for starting SillyTavern with one tap on Android (Termux).
#
#   bash setup.sh            set everything up (asks two questions)
#   bash setup.sh --yes      set up with the default answers
#   bash setup.sh --remove   undo everything this script added
#   bash setup.sh --dir PATH use SillyTavern in PATH instead of finding it
#
# It adds:
#   ~/.shortcuts/SillyTavern        one tap: start SillyTavern (if needed) and open it
#   ~/.shortcuts/Stop SillyTavern   stop it
#   ~/.shortcuts/icons/SillyTavern.png
#   optionally: start it whenever you open Termux (~/.bashrc)
#   optionally: start it when the phone boots (~/.termux/boot, needs Termux:Boot)

set -u

PREFIX="${PREFIX:-/data/data/com.termux/files/usr}"
SHORTCUTS="$HOME/.shortcuts"
BOOT_DIR="$HOME/.termux/boot"
BASHRC="$HOME/.bashrc"
MARK_BEGIN="# >>> SillyTavern autostart (Mobile UI) >>>"
MARK_END="# <<< SillyTavern autostart (Mobile UI) <<<"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ASSUME_YES=0
REMOVE=0
ST_DIR=""
while [ $# -gt 0 ]; do
    case "$1" in
        --yes|-y) ASSUME_YES=1 ;;
        --remove|--uninstall) REMOVE=1 ;;
        --dir) shift; ST_DIR="${1:-}" ;;
        *) echo "Unknown option: $1"; exit 2 ;;
    esac
    shift
done

say() { printf '%s\n' "$*"; }
ok() { printf '  \033[32m✓\033[0m %s\n' "$*"; }

# ask "question" default(y/n) -> returns 0 for yes
ask() {
    local question="$1" default="$2" answer hint
    if [ "$default" = "y" ]; then hint="Y/n"; else hint="y/N"; fi
    if [ "$ASSUME_YES" = 1 ] || [ ! -r /dev/tty ]; then
        answer="$default"
    else
        read -r -p "$question [$hint] " answer < /dev/tty || answer="$default"
        answer="${answer:-$default}"
    fi
    case "$answer" in [Yy]*) return 0 ;; *) return 1 ;; esac
}

remove_bashrc_block() {
    [ -f "$BASHRC" ] || return 0
    awk -v b="$MARK_BEGIN" -v e="$MARK_END" '
        $0 == b { skip = 1; next }
        $0 == e { skip = 0; next }
        !skip { print }
    ' "$BASHRC" > "$BASHRC.stmui.tmp" && mv "$BASHRC.stmui.tmp" "$BASHRC"
}

if [ "$REMOVE" = 1 ]; then
    rm -f "$SHORTCUTS/SillyTavern" "$SHORTCUTS/Stop SillyTavern" "$SHORTCUTS/icons/SillyTavern.png" "$BOOT_DIR/start-sillytavern"
    remove_bashrc_block
    ok "Removed the SillyTavern shortcuts and autostart."
    exit 0
fi

# ---- find SillyTavern -------------------------------------------------------

find_st_dir() {
    # 1. This script usually lives inside SillyTavern's extensions folder; walk up to server.js.
    local dir="$HERE"
    while [ "$dir" != "/" ] && [ -n "$dir" ]; do
        if [ -f "$dir/server.js" ] && [ -f "$dir/package.json" ] && grep -q '"sillytavern"' "$dir/package.json" 2>/dev/null; then
            printf '%s' "$dir"; return 0
        fi
        dir="$(dirname "$dir")"
    done
    # 2. The usual places.
    for dir in "$HOME/SillyTavern" "$HOME/sillytavern" "$HOME/ST"; do
        if [ -f "$dir/server.js" ]; then printf '%s' "$dir"; return 0; fi
    done
    return 1
}

if [ -z "$ST_DIR" ]; then
    ST_DIR="$(find_st_dir)" || {
        say "Could not find SillyTavern. Run again with its folder, for example:"
        say "  bash setup.sh --dir ~/SillyTavern"
        exit 1
    }
fi
ST_DIR="$(cd "$ST_DIR" && pwd)"
if [ ! -f "$ST_DIR/server.js" ]; then
    say "$ST_DIR does not look like SillyTavern (no server.js)."
    exit 1
fi

say ""
say "Setting up one-tap start for SillyTavern in:"
say "  $ST_DIR"
say ""

if ! command -v node > /dev/null 2>&1; then
    say "Node.js is missing. Install it first:  pkg install nodejs"
    exit 1
fi
if ! command -v curl > /dev/null 2>&1; then
    say "Installing curl (used to check when SillyTavern is ready)..."
    pkg install -y curl > /dev/null 2>&1 || apt-get install -y curl > /dev/null 2>&1
    command -v curl > /dev/null 2>&1 || { say "Please install curl:  pkg install curl"; exit 1; }
fi

if ! command -v pkill > /dev/null 2>&1; then
    pkg install -y procps > /dev/null 2>&1 || apt-get install -y procps > /dev/null 2>&1
fi

mkdir -p "$SHORTCUTS/icons"

# ---- the one-tap start script ----------------------------------------------

cat > "$SHORTCUTS/SillyTavern" <<EOF
#!$PREFIX/bin/bash
# Start SillyTavern if it is not running, then open it. Made by Mobile UI's setup.sh.
ST_DIR="$ST_DIR"
EOF
cat >> "$SHORTCUTS/SillyTavern" <<'EOF'
PORT="$(grep -E '^port:' "$ST_DIR/config.yaml" 2>/dev/null | head -n 1 | tr -dc '0-9')"
URL="http://127.0.0.1:${PORT:-8000}/"

is_up() { curl -s -o /dev/null -m 2 "$URL"; }
open_it() {
    termux-open-url "$URL" > /dev/null 2>&1 \
        || am start -a android.intent.action.VIEW -d "$URL" > /dev/null 2>&1 \
        || echo "Open $URL in your browser."
}

if is_up; then
    if [ "${1:-}" = "--quiet-if-running" ]; then
        echo "SillyTavern is already running: $URL"
    else
        echo "SillyTavern is already running. Opening it..."
        open_it
    fi
    exit 0
fi

cd "$ST_DIR" || { echo "SillyTavern folder not found: $ST_DIR"; read -r -n 1 -p "Press any key to close."; exit 1; }

# Keep Android from putting Termux to sleep while SillyTavern runs.
command -v termux-wake-lock > /dev/null 2>&1 && termux-wake-lock

echo "Starting SillyTavern... it opens in your browser as soon as it's ready."
echo "Keep this window in the background. To stop: Ctrl+C here, or the 'Stop SillyTavern' shortcut."
echo ""

# Open the browser once the server answers (it takes a few seconds the first time).
(
    for _ in $(seq 1 240); do
        sleep 1
        if is_up; then open_it; exit 0; fi
    done
) &

exec node server.js --browserLaunchEnabled false
EOF

# ---- stop script -----------------------------------------------------------

cat > "$SHORTCUTS/Stop SillyTavern" <<EOF
#!$PREFIX/bin/bash
# Stop SillyTavern. Made by Mobile UI's setup.sh.
if pkill -f "node server.js"; then echo "SillyTavern stopped."; else echo "SillyTavern was not running."; fi
command -v termux-wake-unlock > /dev/null 2>&1 && termux-wake-unlock
sleep 1
EOF

chmod 700 "$SHORTCUTS/SillyTavern" "$SHORTCUTS/Stop SillyTavern"
ok "Added the 'SillyTavern' and 'Stop SillyTavern' shortcuts"

# The icon: next to this script, inside SillyTavern's extensions, or from GitHub.
ICON=""
for candidate in "$HERE/../assets/icon-192.png"     "$ST_DIR"/data/*/extensions/*Mobile-UI*/assets/icon-192.png     "$ST_DIR"/public/scripts/extensions/third-party/*Mobile-UI*/assets/icon-192.png; do
    if [ -f "$candidate" ]; then ICON="$candidate"; break; fi
done
if [ -n "$ICON" ]; then
    cp "$ICON" "$SHORTCUTS/icons/SillyTavern.png"
elif ! curl -fsSL -m 20 -o "$SHORTCUTS/icons/SillyTavern.png" "https://raw.githubusercontent.com/brabro1/SillyTavern-Mobile-UI/main/assets/icon-192.png"; then
    rm -f "$SHORTCUTS/icons/SillyTavern.png"
fi
[ -f "$SHORTCUTS/icons/SillyTavern.png" ] && ok "Added the SillyTavern icon for the shortcut"

# ---- start when Termux opens -----------------------------------------------

remove_bashrc_block
if ask "Start SillyTavern automatically whenever you open Termux?" y; then
    {
        echo "$MARK_BEGIN"
        echo 'if [ -z "${STMUI_AUTOSTARTED:-}" ] && [ -x "$HOME/.shortcuts/SillyTavern" ]; then'
        echo '    export STMUI_AUTOSTARTED=1'
        echo '    "$HOME/.shortcuts/SillyTavern" --quiet-if-running'
        echo 'fi'
        echo "$MARK_END"
    } >> "$BASHRC"
    ok "Opening Termux now starts SillyTavern (if it isn't running yet)"
fi

# ---- start when the phone boots --------------------------------------------

rm -f "$BOOT_DIR/start-sillytavern"
if ask "Also start SillyTavern when the phone turns on? (needs the Termux:Boot app)" n; then
    mkdir -p "$BOOT_DIR"
    cat > "$BOOT_DIR/start-sillytavern" <<EOF
#!$PREFIX/bin/bash
# Start SillyTavern at boot. Made by Mobile UI's setup.sh.
termux-wake-lock
cd "$ST_DIR" && nohup node server.js --browserLaunchEnabled false > "\$HOME/sillytavern.log" 2>&1 &
EOF
    chmod 700 "$BOOT_DIR/start-sillytavern"
    ok "SillyTavern starts when the phone boots (open Termux:Boot once to activate it)"
fi

say ""
say "Done! Last step, on your home screen:"
say "  1. Install the 'Termux:Widget' app (from the same place you got Termux, e.g. F-Droid)."
say "  2. Long-press an empty spot on your home screen > Widgets > Termux:Widget,"
say "     or long-press the Termux:Widget app icon and drag the 'SillyTavern' shortcut out."
say "  3. Tap the SillyTavern shortcut: it starts SillyTavern and opens it."
say ""
say "Tip: in Android settings, set Termux's battery use to 'Unrestricted' so it isn't closed in the background."
say "To undo all of this:  bash \"$HERE/$(basename "${BASH_SOURCE[0]}")\" --remove"
