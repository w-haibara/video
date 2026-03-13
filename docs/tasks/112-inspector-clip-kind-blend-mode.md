# 112: Inspector の clipKind ベース判定 + BlendModeEditor 追加

**背景:** Inspector エディタの表示条件（`canHandle`）は現在 `ctx.trackKind` で判定している。これを `ctx.clipKind`（= `clip.clipKind`）ベースに変更する。また、動画クリップの合成方法を設定する `BlendModeEditor` を追加する。

**対象ファイル:**
- `app/frontend/src/lib/inspector-editor-registry.ts`（コンテキスト型変更）
- `app/frontend/src/lib/builtin-plugin.ts`（canHandle 条件更新）
- `app/frontend/src/components/editors/BlendModeEditor.tsx`（新規）
- `app/frontend/src/components/InspectorPanel.tsx`（clipKind 渡し変更）

**変更内容:**

**A. InspectorEditorContext の変更**

- [x] `trackKind: string` を `clipKind: string` に変更する

**B. 各エディタの canHandle 条件更新**

- [x] `TrimEditor`: `() => true` のまま維持（全クリップ共通）
- [x] `TextEditor`: `ctx.trackKind === "title"` → `ctx.clipKind === "title"` に変更
- [x] `TransformEditor`: `ctx.trackKind === "video"` → `ctx.clipKind === "video" || ctx.clipKind === "image"` に変更
- [x] `AudioVolumeEditor`: `ctx.trackKind === "audio"` → `ctx.clipKind === "audio"` に変更

**C. BlendModeEditor の新規作成**

- [x] `BlendModeEditor.tsx` コンポーネントを作成する
- [x] `canHandle`: `ctx.clipKind === "video" || ctx.clipKind === "image"`（映像系クリップのみ）
- [x] `compositeStrategyRegistry.all()` からドロップダウンの選択肢を生成する
- [x] 現在の `clip.blendMode ?? "cover"` を表示し、変更時に `onUpdate({ blendMode: value })` を呼ぶ
- [x] `order: 25`（TransformEditor の後）

**D. builtin-plugin への登録**

- [x] `registerInspectorEditors` に BlendModeEditor を追加する

**E. InspectorPanel の変更**

- [x] `InspectorEditorContext` に渡す値を `trackKind` から `clipKind: clip.clipKind` に変更する

**確認方法:** 動画クリップ選択時に BlendModeEditor が表示され、"Cover (覆い隠す)" が選択されていること。テキストクリップ選択時には BlendModeEditor が表示されないこと。
