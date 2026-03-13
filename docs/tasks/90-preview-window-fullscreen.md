# 90: プレビューのウィンドウ内フルスクリーン表示

**背景:** 現在のプレビューはエディタ画面左カラム（グリッド `1fr 2fr` の左側）に固定表示されており、映像を大きく確認したい場合に不便。プレビューをウィンドウ全体に拡大して表示する機能を追加する。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.tsx`
- `app/frontend/src/components/EditorLayout.tsx`
- `app/frontend/src/pages/EditorPage.tsx`

**変更内容:**

**A. フルスクリーン状態管理の追加** (`EditorPage.tsx`)

- [ ] `isPreviewFullscreen` state を追加（`useState<boolean>(false)`）
- [ ] `togglePreviewFullscreen` コールバックを定義し、`PreviewPlayer` に props として渡す

**B. PreviewPlayer にフルスクリーントグルボタンを追加** (`PreviewPlayer.tsx`)

- [ ] props に `isFullscreen?: boolean` と `onToggleFullscreen?: () => void` を追加
- [ ] トランスポートコントロール右端に拡大ボタン（`⛶` or 適切なアイコン）を追加
  - クリックで `onToggleFullscreen` を呼び出す
  - フルスクリーン時はアイコンを縮小表示用に切り替え
- [ ] Esc キーでフルスクリーン解除するキーボードイベントリスナーを追加（`useEffect` で `keydown` を監視）

**C. フルスクリーン時のオーバーレイレイアウト** (`EditorLayout.tsx`)

- [ ] `isPreviewFullscreen` prop を追加
- [ ] フルスクリーン時、プレビューコンテナを `position: fixed; inset: 0; z-index: 1000` のオーバーレイとして描画
  - 背景色は `theme.bg`（他パネルを完全に覆う）
  - プレビューキャンバスは `width: 100vw; height: calc(100vh - トランスポートコントロール高さ)` に拡大
  - トランスポートコントロールは下部に固定表示
- [ ] フルスクリーン時もタイムラインの再生状態・シーク操作は引き続き連動すること（状態は EditorPage で一元管理のため特別な対応は不要）

**D. キャンバススケーリングの対応** (`PreviewPlayer.tsx`)

- [ ] 既存の `ResizeObserver` による `canvasScale` 計算がフルスクリーン時のコンテナサイズ変更にも追従することを確認
  - コンテナが `100vw` に拡大されると `renderedWidth` が変わるため、`canvasScale` が自動的に再計算される
- [ ] テキストオーバーレイのスケーリングがフルスクリーン時にも正しく動作することを確認

**確認方法:**
- 拡大ボタンクリックでプレビューがウィンドウ全体に表示されること
- フルスクリーン中も再生・一時停止・シークが正常動作すること
- フルスクリーン中もテキストオーバーレイ・Crop 表示が正しくスケーリングされること
- Esc キーまたは縮小ボタンで元のレイアウトに戻ること
- ブラウザウィンドウのリサイズに追従すること
