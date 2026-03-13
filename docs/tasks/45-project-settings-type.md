# 45: 共有型に ProjectSettings を追加

プロジェクトに設定フィールドを追加し、動画時間のデフォルト値を定義する。

**A. 型定義の追加** (`app/shared/src/types/project.ts`)
- [x] `ProjectSettings` 型を新規定義:
  ```typescript
  export type ProjectSettings = {
    durationMs: number; // 動画全体の目標尺 (ミリ秒)
  };
  ```
- [x] `Project` 型に `settings: ProjectSettings` フィールドを追加 (必須フィールド)
- [x] `index.ts` re-export に `ProjectSettings` を追加

**B. デフォルト値の定義** (`app/shared/src/utils/constants.ts`)
- [x] `DEFAULT_PROJECT_DURATION_MS = 10_000` (10 秒) を追加

**C. プロジェクト作成時のデフォルト設定**
- [x] バックエンドの `createProject()` (`app/backend/src/services/project-service.ts`) で `settings: { durationMs: DEFAULT_PROJECT_DURATION_MS }` を初期値として設定
- [x] フロントエンドの `useCreateProject` (`app/frontend/src/api/projects.ts`) はバックエンド側でデフォルト設定するため変更不要
