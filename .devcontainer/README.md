# Devcontainer

Claude Code を `--dangerously-skip-permissions` で運用するための devcontainer。ファイアウォールで許可ドメイン以外への通信をブロックする。

## Setup

コンテナ内から `git push` するには、ホストで `GITHUB_TOKEN` 環境変数をセットしてから起動する:

```bash
export GITHUB_TOKEN="$(gh auth token)"

# ビルド & 起動
devcontainer up --workspace-folder .

# コンテナ内でコマンド実行
devcontainer exec --workspace-folder . claude --dangerously-skip-permissions

# 停止
docker stop $(docker ps -q --filter label=devcontainer.local_folder=$(pwd))
```

## ブラウザテスト

コンテナ内でブラウザテストを実行する場合は `xvfb-run` が必要:

```bash
cd app/frontend && xvfb-run bun run test:browser
```
