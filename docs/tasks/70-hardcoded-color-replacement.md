# 70: ハードコード色のテーマ変数置換

現状: 複数のコンポーネントで `"#fff"`, `"#000"`, `rgba(...)` などの色がハードコードされており、テーマとの一貫性が損なわれている。

目標:
- すべてのハードコード色を `theme` 変数に置換する
- 必要に応じて `theme.ts` に新しい色定数を追加する

**A. theme.ts への色定数追加** (`app/frontend/src/theme.ts`)
- [x] `white: '#FFFFFF'` を追加（クリップラベル・ボタンテキスト等で使用）
- [x] `black: '#000000'` を追加（プレビュー背景等で使用）
- [x] `overlayLight: 'rgba(255,255,255,0.2)'` を追加（サムネイルボタン等）
- [x] `overlayDark: 'rgba(0,0,0,0.85)'` を追加（ツールチップ背景等）
- [x] `clipLabelText: '#FFFFFF'` を追加（クリップ上の白テキスト用）

**B. AssetThumbnail.tsx のハードコード色置換** (`app/frontend/src/components/AssetThumbnail.tsx`)
- [x] L120: `color: "#fff"` → `color: theme.clipLabelText`
- [x] L144: `background: "rgba(248,85,82,0.5)"` → `background: theme.errorOverlay`
- [x] L161, L175: `background: "rgba(255,255,255,0.2)"` → `background: theme.overlayLight`
- [x] L162, L176: `border: "1px solid rgba(255,255,255,0.5)"` → `theme.overlayLightBorder` 変数化

**C. TimelineClip.tsx のハードコード色置換** (`app/frontend/src/components/TimelineClip.tsx`)
- [x] L175: `color: "#fff"` → `color: theme.clipLabelText`
- [x] L200: `background: "rgba(0,0,0,0.85)"` → `background: theme.overlayDark`
- [x] L201: `color: "#fff"` → `color: theme.white`
- [x] L241: `background: "rgba(255,255,255,0.3)"` → `background: theme.overlayLightMed`
- [x] L243-244: `rgba(255,255,255,...)` → `theme.overlayLightBorder`, `theme.overlayLightSubtle` 変数化

**D. PreviewPlayer.tsx のハードコード色置換** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] L315: `"#000"` → `theme.black`

**E. EditorPage.tsx のハードコード色置換** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] L198-199: `color: "#ffffff"`, `backgroundColor: "#000000"` → `theme.white`, `theme.black`
