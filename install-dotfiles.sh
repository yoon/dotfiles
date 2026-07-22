#!/bin/sh
#
# Install personal dotfiles by symlinking them into $HOME.
# To skip a dotfile, comment out its line in the "What to install" list below.
# POSIX sh; run it (don't source it) so $0 resolves to this script's path.

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd -P)"

# link <repo-relative-source> <target>
# Symlinks source -> target. If target is a pre-existing REAL file (not a symlink),
# back it up to <target>.bak first so nothing is silently clobbered.
link() {
  local src="$DOTFILES_DIR/$1" dst="$2"
  if [ -e "$dst" ] && [ ! -L "$dst" ]; then
    bak="$dst.$(date +%Y%m%d).bak"   # date-stamped so re-runs don't clobber a prior backup
    echo "*** $dst exists — backing up to $bak"
    mv "$dst" "$bak"
  fi
  mkdir -p "$(dirname "$dst")"
  rm -f "$dst"                    # clear any existing symlink (avoids ln dereferencing into a dir)
  ln -s "$src" "$dst" && echo "  $dst -> $src"
}

# ─── What to install (comment out a line to skip that dotfile) ───────────────
link pi/AGENTS.md       "$HOME/.pi/agent/AGENTS.md"   # pi agent instructions (portable layer)
link gemrc              "$HOME/.gemrc"                # RubyGems: --no-document
link gitconfig.personal "$HOME/.gitconfig.personal"  # git name/aliases/prefs (see gitconfig hook)
link gitignore          "$HOME/.gitignore"           # global ignore: .DS_Store, *~
link vimrc              "$HOME/.vimrc"                # vim config
link shell/shrc         "$HOME/.shrc"                 # portable aliases (see shrc hook)
# pi agent tooling (portable, no employer content). Extensions land as .disabled
# (inactive by default — drop the .disabled to enable). See pi/AGENTS.md separately.
link pi/prompts/reflect.md   "$HOME/.pi/agent/prompts/reflect.md"                # /reflect session retro
link pi/bin/pi-reflect-stats "$HOME/.local/bin/pi-reflect-stats"                 # session stats (jq)
link pi/bin/pi-session-speed "$HOME/.local/bin/pi-session-speed"                 # per-turn timing (node)
link pi/extensions/route-model.ts "$HOME/.pi/agent/extensions/route-model.ts.disabled" # model routing (off)
link pi/extensions/speed.ts       "$HOME/.pi/agent/extensions/speed.ts.disabled"       # speed gears (off)
# ─────────────────────────────────────────────────────────────────────────────

# Hook (pairs with gitconfig.personal): ensure a machine-local ~/.gitconfig exists and
# includes ~/.gitconfig.personal. Idempotent; leaves existing email/dev/tool config intact.
touch "$HOME/.gitconfig"
git config --file "$HOME/.gitconfig" --get-all include.path 2>/dev/null | grep -q '\.gitconfig\.personal$' \
  || git config --file "$HOME/.gitconfig" --add include.path "~/.gitconfig.personal"

# Hook (pairs with shrc): source ~/.shrc from interactive zsh. Idempotent.
grep -q '\.shrc' "$HOME/.zshrc" 2>/dev/null \
  || printf '\n# Personal portable shell config\n[ -f ~/.shrc ] && . ~/.shrc\n' >> "$HOME/.zshrc"

exit 0
