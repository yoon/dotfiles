# Herdr configuration

## Move the current tab between workspaces

Press `Ctrl+B`, then `M`. The popup lists every workspace except the current one:

```text
Move tab to workspace
1–9 to move · ↑/↓ or j/k · Enter · Esc to cancel

1. PR review
2. prod support
3. dxp
```

Press a displayed number to move immediately, or select with the arrow keys / `j` / `k` and press Enter. Escape or `q` cancels.

`herdr-move-tab` moves every pane in the current tab, recreates horizontal and vertical splits with their original ratios, preserves the tab label, and focuses the pane that was focused before the move. Herdr closes the source tab after its last pane moves.

The Herdr API does not provide an atomic cross-workspace tab move. The helper validates the complete layout before changing anything. If a Herdr call fails after movement starts, it stops and reports how many panes moved and the target tab ID; it does not guess at a rollback.

## Install

From this repository:

```sh
./install-dotfiles.sh
herdr server reload-config
```

The installer links:

- `herdr/config.toml` → `~/.config/herdr/config.toml`
- `herdr/bin/herdr-move-tab` → `~/.local/bin/herdr-move-tab`

## Test

```sh
python3 -m unittest discover -s herdr/tests -v
```
