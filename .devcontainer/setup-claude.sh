#!/bin/bash
set -euo pipefail

sudo git config --system --add safe.directory /workspace

CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-/home/alice/.claude}"
mkdir -p "$CLAUDE_DIR"
if [ ! -f "$CLAUDE_DIR/settings.json" ]; then
  echo '{}' > "$CLAUDE_DIR/settings.json"
  echo "[setup-claude] Created default settings.json"
fi

# Configure GitHub authentication if GITHUB_TOKEN is available
if [ -n "${GITHUB_TOKEN:-}" ]; then
  sudo git config --system url."https://github.com/".insteadOf "git@github.com:"
  sudo git config --system credential.helper \
    '!f() { echo "username=x-access-token"; echo "password=${GITHUB_TOKEN}"; }; f'
  echo "[setup-claude] GitHub authentication configured"
fi
