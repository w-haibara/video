# 77: 共有型に canvasWidth / canvasHeight を追加

**背景:** 動画全体の画面サイズ（キャンバスサイズ）を設定可能にする。キャンバスより大きい素材は自動でクロップされ、小さい素材は黒背景にセンタリング表示される。まず共有型定義とデフォルト定数を追加する。

**対象ファイル:**
- `app/shared/src/types/project.ts`
- `app/shared/src/utils/constants.ts`
- `app/backend/src/services/project-service.ts`

**変更内容:**
- [x] `ProjectSettings` に `canvasWidth: number` と `canvasHeight: number` を追加
- [x] `constants.ts` に `DEFAULT_CANVAS_WIDTH = 1920` と `DEFAULT_CANVAS_HEIGHT = 1080` を追加
- [x] `project-service.ts` の新規プロジェクト作成時に `canvasWidth` / `canvasHeight` のデフォルト値を設定
- ~~既存プロジェクトの後方互換性~~ → 既存プロジェクトを削除して対応

**確認方法:** TypeScript コンパイルが通ること、既存テストが Pass すること
