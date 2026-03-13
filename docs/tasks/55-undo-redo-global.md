# 55: Undo/Redo UI を Inspector から分離してグローバル配置

現状: `SaveIndicator` コンポーネント（undo/redo ボタン + 保存状態ラベル）が Inspector タブのコンテンツ内に配置されている (`EditorPage.tsx:133-140`)。undo/redo はプロジェクト全体の操作であり、個々のクリップに紐づく Inspector 内にあるのは意味的に不自然。

目標: undo/redo ボタンと保存状態表示を Inspector から分離し、エディタ全体に対するグローバルな UI として配置する。

**A. SaveIndicator を Inspector コンテンツから除去** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `inspectorContent` から `SaveIndicator` を除去
  - 現在: `inspectorContent` の `<div>` 内に `SaveIndicator` + `InspectorPanel` が並列配置
  - 変更後: `inspectorContent` は `InspectorPanel` のみにする

**B. ツールバー領域の新設** (`app/frontend/src/components/EditorLayout.tsx`)
- [ ] `EditorLayout` に `toolbar` スロット (prop) を追加
- [ ] プレビュー領域の上部、または右ペインのタブバー上部にツールバー行を配置
  - 推奨配置: プレビュー領域の上に横幅全体を使ったツールバー行
  - 高さ: 32-36px 程度の薄いバー
- [ ] ツールバーのスタイル: 背景色はエディタのヘッダー/パネルと統一、左右に要素を分散配置できる flex レイアウト

**C. SaveIndicator をツールバーに移動** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `EditorLayout` の `toolbar` prop に `SaveIndicator` を渡す
- [ ] SaveIndicator の props (status, canUndo, canRedo, onUndo, onRedo) はそのまま維持
- [ ] ツールバー内での配置: 右寄せ (将来的に左側に他のツールバーボタンを追加可能)

**D. SaveIndicator コンポーネントの微調整** (`app/frontend/src/components/SaveIndicator.tsx`)
- [ ] ツールバー配置に合わせたスタイル微調整（必要に応じて）
  - 横並びレイアウトは既存のまま活用
  - フォントサイズ・ボタンサイズがツールバーの高さに合うか確認

**E. 動作確認**
- [ ] undo/redo ボタンがツールバーに表示されること
- [ ] Inspector タブ内に undo/redo が表示されないこと
- [ ] undo/redo のクリック操作が正常に動作すること
- [ ] キーボードショートカット (Ctrl+Z / Ctrl+Shift+Z) は影響を受けないこと
- [ ] 保存状態ラベル (Saving.../Saved/Error) が正常に表示されること
