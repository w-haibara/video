#!/bin/bash
set -euo pipefail
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-/home/node/.claude}"
mkdir -p "$CLAUDE_DIR"
if [ ! -f "$CLAUDE_DIR/settings.json" ]; then
  echo '{}' > "$CLAUDE_DIR/settings.json"
  echo "[setup-claude] Created default settings.json"
fi
