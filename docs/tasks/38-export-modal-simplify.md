# 38: Export モーダル簡素化: エクスポート→自動ダウンロード

現状: Export モーダルに過去の Exported Files 一覧が表示されている。エクスポート完了後は手動で Download リンクをクリックする必要がある。ユーザーが求めるのは「Start Export を押したらエクスポートしてそのままダウンロードされる」というシンプルなフローである。

修正方針:

**A. Exported Files 一覧の削除** (`app/frontend/src/components/ExportDialog.tsx`)
- [x] `useExports` フックの使用を削除
- [x] Exported Files セクション (`<h4>Exported Files</h4>` 以下のファイルリスト) を削除
- [x] タスク37 で追加した `refetchExports` 関連の `useEffect` を削除 (一覧表示がなくなるため不要)

**B. エクスポート完了時の自動ダウンロード** (`app/frontend/src/components/ExportDialog.tsx`)
- [x] `useEffect` で `job?.status === "completed"` を監視し、完了時に自動ダウンロードを実行
  - `exportedFilenameRef` でエクスポート開始時のファイル名を記録
  - ダウンロード URL: `/media/projects/${projectId}/exports/${filename}`
  - プログラム的に `<a>` 要素を生成して `.click()` でダウンロードをトリガー
- [x] `downloadedRef` フラグで同じジョブに対する重複ダウンロードを防止

**C. 不要になった API フックの整理** (`app/frontend/src/api/exports.ts`)
- [x] `useExports` フックを削除 (使用箇所がなくなるため)

## Phase 11 Tasks — エディタ画面レイアウト大改修

### 現状の課題

現在のエディタ画面は 3 カラム + 下部タイムラインの構成:
```
┌──────────┬─────────────────────┬──────────┐
│  Assets  │   Preview Player    │Inspector │
│  (240px) │      (1fr)          │ (240px)  │
├──────────┴─────────────────────┴──────────┤
│              Timeline (220px)              │
└───────────────────────────────────────────┘
```

問題点:
- プレビューが中央に大きく配置されているが、編集作業中は Inspector の操作が主であり、プレビューは確認用
- Assets パネルと Inspector パネルがそれぞれ 240px と狭く、操作しにくい
- Assets / Inspector / Export ボタンなどの機能が分散している

### 目標レイアウト

プレビューを左端に固定し、右側の広いエリアを 1 ペインにまとめてタブで切り替える。Inspector をデフォルトタブとして最も目立つ位置に配置する。

```
┌───────────────┬─────────────────────────────┐
│               │  [Inspector] [Assets] [Export]│ ← タブバー
│   Preview     ├─────────────────────────────┤
│   Player      │                             │
│   (1/3幅)     │   タブコンテンツ (2/3幅)      │
│               │   (Inspector がデフォルト)    │
│               │                             │
├───────────────┴─────────────────────────────┤
│              Timeline (220px, 全幅)          │
└─────────────────────────────────────────────┘
```
