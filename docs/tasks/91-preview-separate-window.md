# 91: プレビューの別ウィンドウ表示

**背景:** デュアルモニター環境やプレビューを独立して確認したい場合に、プレビューを別ウィンドウ（ポップアウト）で開く機能を追加する。タスク 90 のフルスクリーン機能と並行して利用可能にする。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.tsx`
- `app/frontend/src/pages/EditorPage.tsx`
- `app/frontend/src/components/PreviewPopout.tsx`（新規）
- `app/frontend/src/hooks/usePreviewPopout.ts`（新規）

**変更内容:**

**A. ポップアウト用カスタムフックの作成** (`usePreviewPopout.ts` 新規)

- [ ] `usePreviewPopout()` フックを作成
  - `window.open()` で子ウィンドウを作成（初期サイズ: 960×540 + コントロール領域）
  - 戻り値: `{ popoutWindow, isPopout, openPopout, closePopout }`
  - 子ウィンドウの `beforeunload` イベントで `isPopout` を `false` にリセット
  - 親ウィンドウの `beforeunload` / ページ遷移時に子ウィンドウを `close()` する cleanup

**B. ポップアウトコンテナコンポーネント** (`PreviewPopout.tsx` 新規)

- [ ] `createPortal` を使い、子ウィンドウの `document.body` にプレビューを描画する React コンポーネント
  - 子ウィンドウに親のスタイルシート（テーマ CSS 変数等）をコピーして適用
  - `PreviewPlayer` をそのまま子ウィンドウ内にレンダリング
- [ ] 子ウィンドウのタイトルを「Preview — {プロジェクト名}」に設定

**C. PreviewPlayer にポップアウトボタンを追加** (`PreviewPlayer.tsx`)

- [ ] props に `isPopout?: boolean` と `onTogglePopout?: () => void` を追加
- [ ] トランスポートコントロールにポップアウトボタン（`↗` or 適切なアイコン）を追加
  - フルスクリーンボタンの隣に配置
  - ポップアウト中は「↙」アイコンに切り替え（クリックでウィンドウを閉じて元に戻す）
- [ ] ポップアウト中はメインウィンドウ側のプレビュー領域に「別ウィンドウで表示中」のプレースホルダーを表示

**D. EditorPage での状態統合** (`EditorPage.tsx`)

- [ ] `usePreviewPopout` を呼び出し、`isPopout` / `openPopout` / `closePopout` を管理
- [ ] ポップアウト中:
  - メインウィンドウのプレビュー領域にプレースホルダーを表示
  - 子ウィンドウに `PreviewPopout` をレンダリング（`PreviewPlayer` を内包）
  - 再生状態・シーク・タイムラインとの連動は React の状態が共有されているため自動的に維持
- [ ] フルスクリーンとポップアウトの排他制御: ポップアウト中にフルスクリーンは無効化（ボタンを disabled にする）、逆も同様

**確認方法:**
- ポップアウトボタンクリックで新しいウィンドウにプレビューが表示されること
- 別ウィンドウ内の再生操作がメインウィンドウのタイムラインと同期すること
- メインウィンドウでのシーク操作が別ウィンドウのプレビューに反映されること
- 別ウィンドウを閉じるとメインウィンドウのプレビューが復帰すること
- メインウィンドウでページ遷移した場合に別ウィンドウが自動的に閉じること
- テキストオーバーレイ・Crop 表示が別ウィンドウ内でも正しく表示されること
