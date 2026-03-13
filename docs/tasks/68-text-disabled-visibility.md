# 68: textDisabled ラベルの視認性改善（全 UI）

現状: 複数のコンポーネントでフィールドラベルや補助テキストに `theme.textDisabled`（`#A9B3A5`）が使われており、ベージュ背景（`#FDF6E3` / `#F4F0D9`）に対してコントラストが不十分で視認性が悪い。

`theme.textDisabled` の全使用箇所（6 ファイル・17 箇所）を精査し、「無効状態の表現」として意図的に使用している箇所は維持、「読ませるべきラベル・テキスト」には `theme.textMuted`（`#939F91`）への変更とフォントサイズの引き上げを行う。

目標:
- フィールドラベル・補助テキストの色を `theme.textMuted` に変更してコントラスト比を改善する
- `fontSize: "10px"` のラベルは `"11px"` に引き上げて可読性を向上させる
- 無効状態（disabled ボタン・メニュー項目）の `textDisabled` 使用は変更しない

**A. InspectorPanel のフィールドラベル** (`app/frontend/src/components/InspectorPanel.tsx`)
- [x] `StartEndEditor` 内の "Start (s)" ラベル (L570): `color: theme.textDisabled` → `color: theme.textMuted`、`fontSize: "10px"` → `fontSize: "11px"`
- [x] `StartEndEditor` 内の "End (s)" ラベル (L583): 同上
- [x] `TrimEditor` 内の "In (s)" ラベル (L221): 同上
- [x] `TrimEditor` 内の "Out (s)" ラベル (L236): 同上
- [x] `TrimEditor` 内の "Duration (s)" ラベル (L250): 同上
- [x] `TransformEditor` 内の "X (px)", "Y (px)" ラベル (L419, L429): 同上
- [x] `TransformEditor` 内の Crop "X", "Y", "W", "H" ラベル (L476, L487, L498, L509): 同上

**B. ProjectSettingsPanel のヘルプテキスト** (`app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [x] L61: "Min: 1s / Max: 3600s (1 hour)" テキスト — `color: theme.textDisabled` → `color: theme.textMuted`、`fontSize: "10px"` → `fontSize: "11px"`

**C. PreviewPlayer のプレースホルダテキスト** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] L330: "No clip at playhead" — `color: theme.textDisabled` → `color: theme.textMuted`

**D. ProjectCard の日付表示** (`app/frontend/src/components/ProjectCard.tsx`)
- [x] L34: `<time>` 要素 — `color: theme.textDisabled` → `color: theme.textMuted`

**E. 変更しない箇所（無効状態の表現として意図的に使用）**
- SaveIndicator.tsx L50, L65: Undo/Redo ボタンの無効時テキスト色 — `canUndo ? theme.text : theme.textDisabled` → 変更不要
- ContextMenu.tsx L68: disabled メニュー項目のテキスト色 — `item.disabled ? theme.textDisabled : theme.text` → 変更不要
