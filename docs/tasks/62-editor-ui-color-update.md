# 62: エディタ UI コンポーネントの色彩更新

エディタ画面のパネル・ダイアログ系コンポーネントの色彩を更新する。

**A. EditorLayout の更新** (`app/frontend/src/components/EditorLayout.tsx`)
- [ ] ツールバー背景: `#1e1e1e` → `theme.bgPanel`
- [ ] プレビュー領域背景: `#111` → `theme.bg`
- [ ] メインペイン背景: `#1a1a1a` → `theme.bgPanel`
- [ ] ボーダー: `#333` → `theme.border`

**B. EditorMainPanel の更新** (`app/frontend/src/components/EditorMainPanel.tsx`)
- [ ] タブバー背景: `#1a1a1a` → `theme.bgPanel`
- [ ] タブ下線: `#333` → `theme.border`
- [ ] アクティブタブ: 背景 `#2a2a2a` → `theme.tabActive`, 下線 `#5b8def` → `theme.tabIndicator`, テキスト `#eee` → `theme.tabText`
- [ ] 非アクティブタブ: テキスト `#888` → `theme.tabTextInactive`
- [ ] ホバー: テキスト `#ccc` → `theme.text`
- [ ] インジケータ (青い丸): `#5b8def` → `theme.tabIndicator`

**C. PreviewPlayer の更新** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] コントロールバー背景: ダーク系 → `theme.bgPanel`
- [ ] ボタン色 → `theme.text` / `theme.textMuted`
- [ ] テキストオーバーレイのデフォルト色の確認 (ユーザー指定色は変更しない)

**D. InspectorPanel の更新** (`app/frontend/src/components/InspectorPanel.tsx`)
- [ ] パネル背景 → `theme.bg`
- [ ] ラベル色: `#888` / `#aaa` → `theme.textMuted`
- [ ] 入力フィールド: ダーク背景 → `theme.bgPanel`, ボーダー `theme.border`, テキスト `theme.text`
- [ ] セクション区切り: `#333` → `theme.border`
- [ ] 削除ボタン: 既存の赤系 → `theme.buttonDanger`

**E. AssetPanel の更新** (`app/frontend/src/components/AssetPanel.tsx`)
- [ ] パネル背景 → `theme.bg`
- [ ] アセット一覧の各行: ダーク系 → `theme.bgPanel`, ホバー → `theme.bgHover`
- [ ] 「+ Import」ボタン → `theme.button` / `theme.buttonText`
- [ ] テキスト → `theme.text` / `theme.textMuted`

**F. AssetThumbnail の更新** (`app/frontend/src/components/AssetThumbnail.tsx`)
- [ ] サムネイル背景 → `theme.bgPanel`
- [ ] ボーダー・枠線 → `theme.border`
- [ ] 「+」ボタン → `theme.accent`

**G. ProjectSettingsPanel の更新** (`app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [ ] 背景・入力フィールド → ライトテーマ化
- [ ] ラベル色 → `theme.textMuted`

**H. ExportDialog の更新** (`app/frontend/src/components/ExportDialog.tsx`)
- [ ] モーダルオーバーレイ → `theme.overlay`
- [ ] ダイアログ背景 → `theme.bg`
- [ ] ボタン → `theme.button`, `theme.buttonDanger`

**I. SaveIndicator の更新** (`app/frontend/src/components/SaveIndicator.tsx`)
- [ ] ステータス色のマッピング更新:
  - `saved`: `#4a4` → `theme.success`
  - `saving`: `#fa0` → `theme.warning`
  - `error`: `#f44` → `theme.error`
- [ ] Undo/Redo ボタン → `theme.bgHover` / `theme.text`

**J. ContextMenu の更新** (`app/frontend/src/components/ContextMenu.tsx`)
- [ ] メニュー背景: ダーク系 → `theme.bg`
- [ ] メニュー項目ホバー → `theme.bgHover`
- [ ] テキスト → `theme.text`
- [ ] ボーダー → `theme.border`
- [ ] シャドウ → `theme.shadow`
