# 40: 右ペインのタブ UI コンポーネント実装

タブバーとタブコンテンツを管理するコンポーネントを新規作成する。

**A. EditorMainPanel コンポーネント** (`app/frontend/src/components/EditorMainPanel.tsx`)
- [ ] 新規作成
- [ ] タブ定義:
  - `Inspector`: InspectorPanel + SaveIndicator (Undo/Redo)
  - `Assets`: AssetPanel + Add Text ボタン
  - `Export`: Export ボタン + ExportDialog トリガー
- [ ] タブ状態管理: `useState<"inspector" | "assets" | "export">("inspector")`
  - デフォルトは `"inspector"` (Inspector が最も使用頻度が高いため)
- [ ] Props: EditorPage から必要な props をすべて受け取る
  - `project`, `selectedClip`, `onUpdateClip`, `onDeleteAsset`, `assets`, `onImportAsset` 等

**B. タブバー UI** (`app/frontend/src/components/EditorMainPanel.tsx` 内)
- [ ] タブバー: `display: flex`, 上部に固定
  - 高さ: 36px
  - 背景: #1a1a1a
  - 下線: 1px solid #333
- [ ] 各タブボタン:
  - アクティブタブ: 背景 #2a2a2a, 下線 2px solid #5b8def, テキスト #eee
  - 非アクティブタブ: 背景 transparent, テキスト #888
  - ホバー: テキスト #ccc
  - パディング: 8px 16px
  - フォントサイズ: 13px
  - カーソル: pointer
- [ ] タブコンテンツ: `flex: 1`, `overflow: auto`, `padding: 8px`

**C. タブコンテンツの切り替え**
- [ ] アクティブなタブのコンテンツのみレンダリング (条件分岐)
  - Inspector タブ: SaveIndicator + InspectorPanel
  - Assets タブ: AssetPanel + "+ Add Text" ボタン
  - Export タブ: Export ボタン + Jobs リンク
- [ ] 非アクティブなタブのコンテンツはアンマウントせず `display: none` で非表示にする
  - AssetPanel のインポート状態やポーリングが失われないようにするため
