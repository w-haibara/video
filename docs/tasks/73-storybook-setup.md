# 73: Storybook 導入 + 全コンポーネントの Story 定義

現状: フロントエンドに Storybook が未導入で、コンポーネントの視覚的なカタログやインタラクティブなドキュメントがない。

目標:
- Storybook 8 を導入し、全 17 コンポーネント + 3 ページの Story を定義する
- 各 Story で主要なバリエーション（props の組み合わせ）をカバーする

**A. Storybook のインストールと設定** (`app/frontend/`)
- [x] `bun add -D @storybook/react-vite @storybook/react @storybook/addon-essentials @storybook/blocks storybook` を実行
- [x] `app/frontend/.storybook/main.ts` を作成:
  - `framework: "@storybook/react-vite"`
  - `stories: ["../src/**/*.stories.@(ts|tsx)"]`
  - `addons: ["@storybook/addon-essentials"]`
- [x] `app/frontend/.storybook/preview.ts` を作成:
  - グローバル CSS (`../src/index.css`) の import
  - デコレーターでテーマ背景色（`theme.bg`）を適用
- [x] `package.json` に `"storybook": "storybook dev -p 6006"`, `"build-storybook": "storybook build"` スクリプトを追加
- [x] `bun run storybook` で起動確認

**B. テーマ定義の確認 Story** (`app/frontend/src/stories/`)
- [x] `Theme.stories.tsx` — テーマ全体を視覚的に確認するための Story:
  - **Colors**: ベースカラー（bg, bgPanel, bgHover, bgDark）、テキストカラー（text, textMuted, textDisabled）、セマンティックカラー（primary, accent, error, warning, success, info）、クリップタイプカラー（clipVideo, clipAudio, clipText + 選択時）、UI 部品カラー（tab, button, timeline 等）をスウォッチで一覧表示
  - **Typography**: fontSize スケール（xs〜heading1）の実サイズ比較、各テキストカラーとの組み合わせ表示
  - **Spacing**: spacing スケール（xs〜xl）のボックス視覚化
  - **Border Radius**: radius スケール（xs〜xl）の適用サンプル
  - **Buttons**: buttonStyle プリセット（primary, secondary, danger, small）の実レンダリング
  - **Inputs**: inputStyle の実レンダリング、各状態（通常・フォーカス・無効）
  - **Shadows & Overlays**: shadow, overlay, overlayLight, overlayDark の視覚サンプル

**C. ページコンポーネントの Story** (`app/frontend/src/pages/`)
- [x] `HomePage.stories.tsx` — プロジェクト一覧表示（0件・複数件）、新規作成ダイアログ表示
- [x] `EditorPage.stories.tsx` — クリップ未選択・選択時、各タブ表示
- [x] `JobLogPage.stories.tsx` — ジョブ一覧表示（空・進行中・完了・失敗）

**D. エディタ系コンポーネントの Story** (`app/frontend/src/components/`)
- [x] `EditorLayout.stories.tsx` — 3 カラムレイアウトのモック
- [x] `EditorMainPanel.stories.tsx` — タブ切り替え
- [x] `InspectorPanel.stories.tsx` — video/audio/text クリップ別の表示
- [x] `AssetPanel.stories.tsx` — アセットなし・あり、インポート中
- [x] `AssetThumbnail.stories.tsx` — 各状態（ready, importing, failed）
- [x] `ProjectSettingsPanel.stories.tsx` — 設定表示
- [x] `SaveIndicator.stories.tsx` — 保存中・完了・Undo/Redo 状態

**E. タイムライン系コンポーネントの Story** (`app/frontend/src/components/`)
- [x] `Timeline.stories.tsx` — 空タイムライン・クリップあり・ズーム状態
- [x] `TimelineTrack.stories.tsx` — トラック表示
- [x] `TimelineClip.stories.tsx` — video/audio/text・選択状態・トリム中
- [x] `TimelineRuler.stories.tsx` — ルーラー表示
- [x] `Playhead.stories.tsx` — プレイヘッド位置バリエーション

**F. プレビュー・その他コンポーネントの Story** (`app/frontend/src/components/`)
- [x] `PreviewPlayer.stories.tsx` — 再生中・停止・テキストオーバーレイ
- [x] `ContextMenu.stories.tsx` — 表示・非表示
- [x] `CreateProjectDialog.stories.tsx` — ダイアログ表示
- [x] `ProjectCard.stories.tsx` — カード表示バリエーション
- [x] `JobProgress.stories.tsx` — 各進捗状態（pending, processing, completed, failed）
