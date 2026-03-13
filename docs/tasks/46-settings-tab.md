# 46: Settings タブの追加

エディタ右ペインに Settings タブを追加し、動画時間を編集できるようにする。

**A. ProjectSettingsPanel コンポーネント** (`app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [x] 新規作成
- [x] Props: `{ project: Project; onUpdateSettings: (settings: ProjectSettings) => void }`
- [x] UI 構成: Duration (sec) 数値入力、バリデーション (1-3600s)、ダークテーマ

**B. EditorMainPanel にタブ追加** (`app/frontend/src/components/EditorMainPanel.tsx`)
- [x] タブ定義を `"inspector" | "assets" | "export" | "settings"` に拡張
- [x] TABS 配列に Settings を追加、Props に `settingsContent` を追加

**C. EditorPage の組み込み** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] `handleUpdateSettings` コールバックを追加 (useUpdateProject で直接保存)
- [x] `ProjectSettingsPanel` を `settingsContent` として渡す

**D. useProjectEditor にプロジェクト設定更新を追加**
- [x] 設定変更はプロジェクトレベルのため、useUpdateProject で直接保存する方式を採用 (undo/redo 対象外)
