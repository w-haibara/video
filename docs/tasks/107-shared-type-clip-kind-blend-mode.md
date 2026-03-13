# 107: 共有型の拡張 — Clip.clipKind・Clip.blendMode 追加 + Track.kind 廃止

**背景:** 現在のアーキテクチャでは `Track.kind`（"video" / "audio" / "title"）によりクリップの種類が決定されている。トラックをレイヤー管理の単位にするため、クリップ自身が種別（`clipKind`）を持つよう型を変更する。また、動画クリップのトラック間重なり合成方法を指定する `blendMode` フィールドを追加する。

**対象ファイル:**
- `app/shared/src/types/project.ts`（型定義変更）
- `app/shared/src/index.ts`（re-export 追加）

**変更内容:**

**A. Clip 型に clipKind フィールドを追加**

- [x] `Clip` 型に `clipKind: string` フィールドを追加する
- [x] `BuiltinClipKind` 型を定義する: `"video" | "audio" | "title" | "image"`

**B. Clip 型に blendMode フィールドを追加**

- [x] `Clip` 型に `blendMode?: string` フィールドを追加する（省略時は `"cover"` として扱う）
- [x] `BuiltinBlendMode` 型を定義する: `"cover"`（将来の拡張用に string ベース）

**C. Track 型から kind を削除**

- [x] `Track` 型から `kind: string` フィールドを削除する
- [x] `BuiltinTrackKind` 型を削除する

**D. マイグレーションユーティリティの追加**

- [x] `utils/migration.ts` に `migrateProject(project: unknown): Project` 関数を追加する
- [x] 旧形式（Track.kind あり・Clip.clipKind なし）のプロジェクトを新形式に変換する
  - Track.kind が "video" のクリップ → asset.kind に応じて clipKind を "video" / "image" に設定
  - Track.kind が "audio" のクリップ → clipKind を "audio" に設定
  - Track.kind が "title" のクリップ → clipKind を "title" に設定
- [x] `project-service.ts` の読み込み時にマイグレーションを適用する

**確認方法:** `bun run test` で既存テストが通ること。型変更に伴うコンパイルエラーを全て解消すること。
