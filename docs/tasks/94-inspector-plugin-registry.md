# 94: Inspector パネルのエディタプラグインレジストリ化

**背景:** 現在の `InspectorPanel.tsx` はトラック種別ごとの表示ロジックを if/else チェーンで分岐している（50 行目: `isTextClip = trackKind === "title"`, 87 行目: `trackKind === "video"`, 95 行目: `trackKind === "audio"`）。新しいトラック種別やフィルタ制御を追加するたびにこのコンポーネントを修正する必要があり、Open/Closed 原則に違反している。

**対象ファイル:**
- `app/frontend/src/lib/inspector-editor-registry.ts`（新規）
- `app/frontend/src/components/editors/TrimEditor.tsx`（`InspectorPanel.tsx` から分離）
- `app/frontend/src/components/editors/TextEditor.tsx`（`InspectorPanel.tsx` から分離）
- `app/frontend/src/components/editors/TransformEditor.tsx`（`InspectorPanel.tsx` から分離）
- `app/frontend/src/components/editors/AudioVolumeEditor.tsx`（`InspectorPanel.tsx` から分離）
- `app/frontend/src/components/editors/index.ts`（新規: 全エディタを登録）
- `app/frontend/src/components/InspectorPanel.tsx`（リファクタリング）

**変更内容:**

**A. エディタプラグインインターフェースの定義** (`inspector-editor-registry.ts`)

- [x] `InspectorEditorPlugin` 型を定義:
  ```typescript
  type InspectorEditorContext = {
    clip: Clip;
    asset: Asset | undefined;
    trackKind: string;
    onUpdate: (updates: Partial<Clip>) => void;
  };

  type InspectorEditorPlugin = {
    id: string;
    label: string;
    order: number;            // 表示順序
    canHandle: (ctx: InspectorEditorContext) => boolean;
    Component: React.ComponentType<InspectorEditorContext>;
  };
  ```
- [x] `InspectorEditorRegistry` クラスを実装:
  - `register(plugin: InspectorEditorPlugin): void`
  - `getEditorsFor(ctx: InspectorEditorContext): InspectorEditorPlugin[]`（`canHandle` でフィルタし `order` でソート）

**B. 既存エディタの分離・プラグイン化**

- [x] `TrimEditor` を独立コンポーネントファイルに抽出し、`InspectorEditorPlugin` として登録
  - `canHandle`: 常に `true`（全クリップに表示）
- [x] `TextEditor` を独立コンポーネントファイルに抽出し、プラグインとして登録
  - `canHandle`: `trackKind === "title"`
- [x] `TransformEditor` を独立コンポーネントファイルに抽出し、プラグインとして登録
  - `canHandle`: `trackKind === "video"`
- [x] `AudioVolumeEditor` を独立コンポーネントファイルに抽出し、プラグインとして登録（現在は `InspectorPanel` 内にインラインで記述: 95〜111 行目）
  - `canHandle`: `trackKind === "audio"`

**C. InspectorPanel のリファクタリング**

- [x] if/else チェーンを削除し、レジストリから取得したエディタを動的にレンダリング:
  ```typescript
  const editors = inspectorEditorRegistry.getEditorsFor(ctx);
  {editors.map((editor) => (
    <editor.Component key={editor.id} {...ctx} />
  ))}
  ```
- [x] メタ情報テーブル（File, Type, Size, Codec）の表示も `TrackKindDescriptor.hasAsset` を参照して分岐

**確認方法:**
- Inspector の表示・操作が全く同じであること
- 新しいエディタプラグインを `register()` で追加すると Inspector に表示されること
- 既存の全テスト・Story が通ること
