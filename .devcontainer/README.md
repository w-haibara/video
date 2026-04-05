# Devcontainer

Claude Code を `--dangerously-skip-permissions` で運用するための devcontainer。ファイアウォールで許可ドメイン以外への通信をブロックする。

## Setup

コンテナ内から `git push` するには、ホストで `GITHUB_TOKEN` 環境変数をセットしてから起動する:

```bash
export GITHUB_TOKEN="$(gh auth token)"

# ビルド & 起動（初回は bun install も自動実行）
devcontainer up --workspace-folder .

# コンテナ内でコマンド実行
devcontainer exec --workspace-folder . claude --dangerously-skip-permissions

# 停止
docker stop $(docker ps -q --filter label=devcontainer.local_folder=$(pwd))
```

## 開発サーバー

ポート 5173 (Vite), 3000 (Backend), 6006 (Storybook) はホストにフォワードされる（`runArgs` の `-p` フラグ）。

```bash
# 開発サーバー起動
devcontainer exec --workspace-folder . bash -c "cd /workspace && bun run dev"

# ホストのブラウザで http://localhost:5173 にアクセス
```

## テスト

```bash
# 全テスト
devcontainer exec --workspace-folder . bash -c "cd /workspace && bun run test"

# 特定のテストファイル
devcontainer exec --workspace-folder . bash -c "cd /workspace && bun test <path>"
```

## node_modules

`node_modules` は Docker ボリュームにマウントされる（ホストの Windows ファイルシステムでは bun の hardlink が動作しないため）。ホスト側で `bun install` や `npm install` を実行しないこと。

依存関係の再インストールが必要な場合:

```bash
devcontainer exec --workspace-folder . bash -c "cd /workspace && bun install"
```

## ブラウザテスト

コンテナ内でブラウザテストを実行する場合は `xvfb-run` が必要:

```bash
cd app/frontend && xvfb-run bun run test:browser
```

## 環境変数

| 変数 | 値 | 用途 |
|------|------|------|
| `CHROMIUM_PATH` | `/opt/google/chrome/chrome` | CDP テスト用の Chromium パス |
| `GITHUB_TOKEN` | ホストから引き継ぎ | git push / gh CLI |
| `DEVCONTAINER` | `true` | コンテナ内判定 |
