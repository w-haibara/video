# Storage Layout

## ディレクトリ構成

```
<project-root>/
  app/
    frontend/          # React + Vite
    backend/           # Bun server
    shared/            # 共有型定義
  workspace/
    projects/
      <project-id>/
        project.json   # 編集状態の正本
        assets/        # import時にコピーした元素材
        proxies/       # proxy動画 (720p H.264)
        thumbnails/    # サムネイル (JPEG 360p)
        cache/         # 一時ファイル
        exports/       # 書き出し結果
  docs/                # 仕様書
```

## ファイル管理方針

### 素材の取り込み

1. ユーザーがファイルを選択（ブラウザのファイルダイアログ）
2. Bunサーバーにアップロード
3. `workspace/projects/<project-id>/assets/` にコピー保存
4. ffprobeでメタデータ抽出
5. サムネイル生成 → `thumbnails/`
6. proxy動画生成 → `proxies/`（動画の場合）
7. HEIC → JPEG変換 → `proxies/`（静止画の場合）

### パスの管理

- project.json内のパスはすべて workspace からの相対パス
- 絶対パスは保持しない（ポータビリティ確保）

### キャッシュ削除

- MVPでは手動削除（UIからの削除機能）
- 自動削除はMVP後に検討

### 容量

- MVPでは容量上限を設けない
- ディスク残量が不足した場合はFFmpegのエラーとして表示
