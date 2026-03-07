# API Spec

## 概要

- Bunサーバーが localhost でHTTPを提供
- フロントエンド（Vite dev server）からプロキシまたはCORS経由でアクセス
- すべてJSON（ファイルアップロードのみ multipart/form-data）

## Asset API

### POST /api/assets/import

素材をインポートする。ファイルアップロード後、メタデータ抽出・サムネイル・proxy生成のjobを開始する。

Request: `multipart/form-data`
- `file`: アップロードファイル
- `projectId`: プロジェクトID

Response:
```json
{
  "asset": { "id": "...", "kind": "video", ... },
  "jobId": "..."
}
```

### GET /api/assets/:id

アセット情報を取得する。

Response:
```json
{
  "id": "...",
  "kind": "video",
  "originalPath": "...",
  "proxyPath": "...",
  "thumbnailPath": "...",
  "width": 1920,
  "height": 1080,
  "durationMs": 15000,
  ...
}
```

## Project API

### POST /api/projects

新規プロジェクトを作成する。

Request:
```json
{
  "name": "My Project"
}
```

Response:
```json
{
  "id": "...",
  "name": "My Project",
  ...
}
```

### GET /api/projects

プロジェクト一覧を取得する。

Response:
```json
{
  "projects": [
    { "id": "...", "name": "...", "updatedAt": "..." }
  ]
}
```

### GET /api/projects/:id

プロジェクトの全データ（project.json）を取得する。

### PUT /api/projects/:id

プロジェクトを更新する（自動保存用）。

Request: project.json の全体

### DELETE /api/projects/:id

プロジェクトとそのworkspaceを削除する。

## Export API

### POST /api/projects/:id/export

エクスポートジョブを開始する。

Request:
```json
{
  "preset": {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "aspectRatio": "16:9"
  },
  "filename": "output.mp4"
}
```

Response:
```json
{
  "jobId": "..."
}
```

### GET /api/projects/:id/exports

エクスポート済みファイルの一覧を取得する。

## Job API

### GET /api/jobs/:id

ジョブのステータスと進捗を取得する。

Response:
```json
{
  "id": "...",
  "type": "import",
  "status": "processing",
  "progress": 0.45,
  "error": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### POST /api/jobs/:id/retry

失敗したジョブをリトライする。

## Media API（静的ファイル配信）

### GET /media/proxies/:projectId/:filename

proxy動画・画像を配信する。

### GET /media/thumbnails/:projectId/:filename

サムネイルを配信する。

### GET /media/exports/:projectId/:filename

エクスポート済み動画をダウンロードする。

## セキュリティ

- localhost のみにbind（`127.0.0.1`）
- ファイルパスはworkspace内に正規化（path traversal防止）
- FFmpegは引数配列で起動（shell injection防止）
- CORS: Vite dev server のオリジンのみ許可
