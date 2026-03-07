# Error Handling

## エラー分類

### Import時

| エラー | 対応 |
|--------|------|
| 未対応コーデック | jobをfailedにし、ユーザーに形式名を表示 |
| 壊れたファイル | ffprobe/ffmpegエラーをキャッチし、failedにする |
| ファイルサイズ超過 | MVPでは制限なし |
| proxy生成失敗 | jobをfailedにし、リトライ可能 |
| サムネイル生成失敗 | デフォルト画像を表示、リトライ可能 |

### Export時

| エラー | 対応 |
|--------|------|
| FFmpeg失敗 | jobをfailedにし、stderrログを保存 |
| ディスク容量不足 | FFmpegエラーとして表示 |
| 元素材が見つからない | エラーメッセージで該当アセットを特定表示 |

### 一般

| エラー | 対応 |
|--------|------|
| project.json破損 | 読み込み時にバリデーションし、エラー表示 |
| FFmpegが未インストール | サーバー起動時にチェックし、ガイドを表示 |
| ポート競合 | 別ポートで起動を試みるか、エラー表示 |

## Job ステータス

```
pending    → 処理待ち
processing → 処理中（progressフィールドで進捗 0.0-1.0）
completed  → 正常完了
failed     → 失敗（error フィールドにメッセージ、retry可能）
```

## ログ

- FFmpegのstderrを job ごとにファイル保存
- 保存先: `workspace/projects/<project-id>/cache/logs/<job-id>.log`
- UIのジョブログ画面から閲覧可能

## ユーザー向けメッセージ

- 技術的な詳細は隠し、何が起きたかと対処法を表示
- 「詳細を見る」で生ログを展開可能
