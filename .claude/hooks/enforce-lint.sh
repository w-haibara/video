#!/bin/bash
# PostToolUse hook: run oxlint after Write/Edit on TS/JS files.
# Exit 2 blocks the tool call; exit 0 allows it.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')

# Skip non-code files
if ! echo "$FILE_PATH" | grep -qE '\.(ts|tsx|js|jsx)$'; then
  exit 0
fi

cd /home/alice/ghq/github.com/w-haibara/video
bun run lint 2>&1 || exit 2
