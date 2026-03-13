# 67: Export タブ再設計: インライン操作化 + View Jobs 移動

現状: Export タブには「Start Export」ボタン（ExportDialog モーダルを開く）と「View Jobs」リンクがある。エクスポート操作はモーダル内で行われる。

目標:
- Export タブ内に直接エクスポート操作 UI（ファイル名入力・実行ボタン・進捗表示）を配置する
- ExportDialog モーダルを廃止する
- View Jobs リンクを Export タブから除去し、Settings タブ内に移動する

**A. Export タブのインラインコンテンツ作成** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] `exportContent` の中身を変更: 現在の「Start Export」ボタン + 「View Jobs」リンクを削除
- [x] ExportDialog の主要 UI をタブ内に直接配置:
  - ファイル名入力フィールド (`export-{timestamp}.mp4` をデフォルト値)
  - 「Start Export」ボタン（直接エクスポートを実行）
  - エクスポート進捗表示 (`JobProgress` コンポーネント)
  - 完了/失敗メッセージ
- [x] 状態管理を EditorPage に移動:
  - `filename` state: エクスポートファイル名
  - `activeJobId` state: 実行中のジョブ ID
  - `exportedFilenameRef` / `downloadedRef`: 自動ダウンロード用 ref
  - `useExport` / `useJob` hooks を EditorPage で直接使用
- [x] 自動ダウンロード処理 (`useEffect` でジョブ完了を監視 → `<a>` タグ経由でダウンロード) を EditorPage に移動

**B. ExportDialog モーダルの廃止**
- [x] `showExport` state を削除 (`EditorPage.tsx`)
- [x] `ExportDialog` コンポーネントの `import` とレンダリングを削除 (`EditorPage.tsx`)
- [x] `app/frontend/src/components/ExportDialog.tsx` ファイルを削除

**C. View Jobs リンクを Settings タブに移動** (`app/frontend/src/pages/EditorPage.tsx`, `app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [x] Export タブから `View Jobs` リンクを削除
- [x] `ProjectSettingsPanel` の末尾に「View Jobs」リンクを追加:
  - `Link to={/projects/${project.id}/jobs}` (既存のルーティングをそのまま利用)
  - セクション区切り線の下に配置し、設定項目と視覚的に分離する
  - スタイル: `theme.bgDark` 背景、`theme.text` テキスト（現状と同じ）
- [x] `ProjectSettingsPanel` の props に `projectId: string` を追加（Link のパス生成に必要）

**D. Export タブ内の UI スタイル調整** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] ファイル名入力: `theme.bgPanel` 背景、`theme.border` ボーダー、`theme.text` テキスト
- [x] Start Export ボタン: `theme.button` 背景、`theme.buttonText` テキスト、エクスポート中は `theme.bgDark` に変更
- [x] 進捗表示: `JobProgress` をそのまま使用
- [x] 完了メッセージ: `theme.success` テキスト
- [x] 失敗メッセージ: `theme.error` テキスト
- [x] 各要素間のマージンを適切に設定（モーダル内と同等の 12px 間隔）
