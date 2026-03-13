# 74: Vitest ブラウザテスト導入 + 全 Story のテスト整備

現状: フロントエンドテストは `bun:test` によるユニットテスト（sequence-ops, timeline-utils, undo-redo）のみ。コンポーネントの描画テストやインタラクションテストがない。

目標:
- Vitest のブラウザモードを導入し、Storybook の各 Story に対応するテストを整備する
- `@storybook/experimental-addon-test` を活用し、Story ベースのコンポーネントテストを実現する

**A. Vitest + Storybook テストのインストールと設定** (`app/frontend/`)
- [x] `bun add -D vitest @vitest/browser playwright @storybook/experimental-addon-test @storybook/test` を実行
- [x] `app/frontend/vitest.config.ts` を作成:
  - `plugins: [storybookTest()]` を設定
  - `browser: { enabled: true, provider: "playwright", instances: [{ browser: "chromium" }] }` を設定
  - `setupFiles: [".storybook/vitest.setup.ts"]` を設定
- [x] `app/frontend/.storybook/vitest.setup.ts` を作成:
  - `@storybook/experimental-addon-test/vitest-plugin` からの `setProjectAnnotations` を呼び出し
- [x] `.storybook/main.ts` の `addons` に `"@storybook/experimental-addon-test"` を追加
- [x] `package.json` に `"test:browser": "vitest --project=storybook"` スクリプトを追加

**B. ページコンポーネントのテスト** (`app/frontend/src/pages/`)
- [x] `HomePage.test.tsx` — プロジェクト一覧の描画、新規作成ボタンクリック
- [x] `EditorPage.test.tsx` — タブ切り替え、クリップ選択でインスペクタ表示
- [x] `JobLogPage.test.tsx` — ジョブ一覧の描画

**C. エディタ系コンポーネントのテスト** (`app/frontend/src/components/`)
- [x] `InspectorPanel.test.tsx` — 各クリップタイプの表示、トリム値入力、回転ボタン
- [x] `AssetPanel.test.tsx` — アセット表示、Import ボタン
- [x] `AssetThumbnail.test.tsx` — 各状態の描画、+ ボタンクリック
- [x] `ProjectSettingsPanel.test.tsx` — Duration 入力、View Jobs リンク
- [x] `SaveIndicator.test.tsx` — Undo/Redo ボタンの活性・非活性

**D. タイムライン系コンポーネントのテスト** (`app/frontend/src/components/`)
- [x] `Timeline.test.tsx` — ズームイン・アウト、タイムライン描画
- [x] `TimelineClip.test.tsx` — クリップ表示、選択、右クリックメニュー
- [x] `TimelineRuler.test.tsx` — ルーラー目盛りの描画
- [x] `Playhead.test.tsx` — プレイヘッド位置の描画

**E. その他コンポーネントのテスト** (`app/frontend/src/components/`)
- [x] `PreviewPlayer.test.tsx` — 再生ボタン、時間表示
- [x] `ContextMenu.test.tsx` — メニュー表示・項目クリック
- [x] `CreateProjectDialog.test.tsx` — ダイアログ表示、入力、送信
- [x] `ProjectCard.test.tsx` — カード表示、リンク先
- [x] `JobProgress.test.tsx` — 各状態の描画（プログレスバー表示）
