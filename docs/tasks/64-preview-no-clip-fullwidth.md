# 64: プレビュー "No clip at playhead" 表示の全幅化

**背景**: プレビュー領域にクリップがない場合、"No clip at playhead" テキストが小さく中央に表示されるが、プレビュー領域の横幅をフルに使えていない。PreviewPlayer コンポーネントに `width: 100%` が設定されておらず、親の EditorLayout が `alignItems: center` で中央寄せしているため横幅が縮んでいる。

**対象ファイル**:
- `app/frontend/src/components/PreviewPlayer.tsx`

**サブタスク**:
- [x] PreviewPlayer のルートコンテナに `width: "100%"` を追加し、プレビュー領域全体を横幅いっぱいに使えるようにする
- [x] "No clip at playhead" 表示時もプレビュー黒背景が全幅に表示されることを確認

---
