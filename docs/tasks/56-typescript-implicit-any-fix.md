# 56: TypeScript 暗黙 any 型エラーの修正

現状: `strict: true` 設定下でコールバック引数に暗黙の `any` 型推論が発生（TS7006）。`@video/shared` の型がビルド未実施で解決できないことが根本原因だが、型注釈を明示することで shared ビルド有無に依存せず型安全にする。

目標: `npx tsc --noEmit -p app/frontend/tsconfig.json` で TS7006 エラーをゼロにする（TS6305, bun:test 関連は対象外）。

**A. sequence-ops.ts の型注釈追加** (`app/frontend/src/lib/sequence-ops.ts`)
- [ ] import に `Track` を追加
- [ ] `.map((t) =>` → `.map((t: Track) =>`（6箇所）
- [ ] `.find((t) =>` → `.find((t: Track) =>`（2箇所）
- [ ] `.find((c) =>` / `.map((c) =>` → `(c: Clip)`（8箇所）
- [ ] `.filter((c) =>` → `(c: Clip)`
- [ ] `.sort((a, b) =>` → `(a: Clip, b: Clip)`（2箇所）
- [ ] `.reduce` の `(max, c)` → `(max: number, c: Clip)`

**B. コンポーネントの型注釈追加**
- [ ] `AssetPanel.tsx:89` — `.map((asset) =>` → `.map((asset: Asset) =>`
- [ ] `InspectorPanel.tsx:16` — `.find((c) =>` → `.find((c: Clip) =>`
- [ ] `InspectorPanel.tsx:18` — `.find((a) =>` → `.find((a: Asset) =>`
- [ ] `PreviewPlayer.tsx:30` — `.find((a) =>` → `.find((a: Asset) =>`
- [ ] `Timeline.tsx:214` — `.map((track) =>` → `.map((track: Track) =>`、import に `Track` 追加
- [ ] `TimelineTrack.tsx:67` — `.map((clip) =>` → `.map((clip: Clip) =>`、import に `Clip` 追加

**C. hooks の型注釈追加**
- [ ] `useProjectEditor.ts:38` — `.find((c) =>` → `.find((c: Clip) =>`
- [ ] `useProjectEditor.ts:40` — `.find((a) =>` → `.find((a: Asset) =>`

**D. HomePage の型注釈追加**
- [ ] `HomePage.tsx:84` — `.map((p) =>` → `.map((p: Project) =>`、import に `Project` 追加

**E. テストファイルの型注釈追加** (`app/frontend/src/lib/sequence-ops.test.ts`)
- [ ] `.find((t) =>` → `.find((t: Track) =>`
- [ ] `.map((c) =>` / `.find((c) =>` → `(c: Clip)`（5箇所）
