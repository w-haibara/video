# 92: プレビュー拡大表示のテスト・Story 追加

**背景:** タスク 90（ウィンドウ内フルスクリーン）と タスク 91（別ウィンドウ表示）の変更に対するテストと Story を追加する。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.stories.tsx`（既存 Story の更新）
- `app/frontend/src/components/PreviewPlayer.test.tsx`（既存 or 新規）
- `app/frontend/src/hooks/usePreviewPopout.test.ts`（新規）

**変更内容:**

**A. フルスクリーン関連の Story 追加** (`PreviewPlayer.stories.tsx`)

- [ ] `Fullscreen` Story を追加: `isFullscreen: true` 状態のプレビュー表示
- [ ] `FullscreenWithTextOverlay` Story を追加: フルスクリーン + テキストオーバーレイ表示

**B. フルスクリーン関連のテスト追加** (`PreviewPlayer.test.tsx`)

- [ ] フルスクリーントグルボタンが表示されること
- [ ] ボタンクリックで `onToggleFullscreen` が呼ばれること
- [ ] Esc キーで `onToggleFullscreen` が呼ばれること（フルスクリーン中のみ）
- [ ] `isFullscreen: true` 時にオーバーレイスタイル（`position: fixed`）が適用されていること

**C. ポップアウトフックのテスト追加** (`usePreviewPopout.test.ts`)

- [ ] `openPopout` で `window.open` が呼ばれること
- [ ] `closePopout` で子ウィンドウの `close` が呼ばれること
- [ ] 子ウィンドウ close 時に `isPopout` が `false` になること
- [ ] cleanup 時に子ウィンドウが close されること

**D. ポップアウト関連の Story 追加** (`PreviewPlayer.stories.tsx`)

- [ ] `PopoutPlaceholder` Story を追加: ポップアウト中のメインウィンドウ側プレースホルダー表示

**確認方法:** `bun run test` と `bun run storybook` で全テスト・Story が正常動作すること

---

## Refactoring Phase: 拡張可能な設計への移行

### 設計方針

GoF デザインパターン（Registry / Strategy / Factory / Template Method）と Open/Closed 原則に基づき、以下の拡張ポイントを新規コード追加のみで対応可能にする:

1. **新しいトラック種別の追加**（例: subtitle, effect, transition）
2. **あらゆるファイル形式のインポート**（例: PSD, SVG, GIF, FLAC）
3. **Inspector での様々なフィルタ制御の追加**（例: 色調補正、ブラー、不透明度）
4. **将来のプラグイン機構**への段階的な基盤整備

各タスクは既存の動作を一切変更せず、内部構造のみをリファクタリングする。
