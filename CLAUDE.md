# CLAUDE.md

## Development Commands

Proactively use `bun run` scripts defined in the root `package.json` when performing development tasks. This includes starting, restarting, and managing the dev server.

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start the development server (backend + frontend) |
| `bun run restart` | Restart the development server (kills both on failure) |
| `bun run test` | Run all tests |

Additional scripts are defined in `app/frontend/package.json` and must be run from that directory:

| Command | Purpose |
|---------|---------|
| `bun run storybook` | Start Storybook dev server on port 6006 |
| `bun run build-storybook` | Build static Storybook |
| `bun run test:browser` | Run Vitest browser tests |

## Devcontainer

Claude Code を `--dangerously-skip-permissions` で運用するための devcontainer。ファイアウォールで許可ドメイン以外への通信をブロックする。

```bash
# ビルド & 起動
devcontainer up --workspace-folder .

# コンテナ内でコマンド実行
devcontainer exec --workspace-folder . claude --dangerously-skip-permissions

# 停止
docker stop $(docker ps -q --filter label=devcontainer.local_folder=$(pwd))
```

コンテナ内でブラウザテストを実行する場合は `xvfb-run` が必要:

```bash
cd app/frontend && xvfb-run bun run test:browser
```
