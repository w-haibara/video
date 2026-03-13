# 78: Settings タブにキャンバスサイズ設定 UI を追加

**背景:** ユーザーがキャンバスサイズを Settings タブから変更できるようにする。

**対象ファイル:**
- `app/frontend/src/components/ProjectSettingsPanel.tsx`
- `app/frontend/src/components/ProjectSettingsPanel.stories.tsx`

**変更内容:**
- [x] ProjectSettingsPanel に「Canvas Size」セクションを追加
- [x] 幅 (Width) と高さ (Height) の数値入力フィールド（最小: 320、最大: 3840）
- [x] よく使うプリセットの選択ボタン: 1920×1080 (16:9)、1280×720 (16:9)、1080×1920 (9:16 縦動画)、1080×1080 (1:1 正方形)
- [x] 入力値のバリデーション（偶数制約: FFmpeg の要件により幅・高さは偶数が必要）
- [x] onUpdateSettings コールバック経由で canvasWidth / canvasHeight を親に通知
- [x] Storybook の Story を更新

**確認方法:** Storybook ProjectSettingsPanel でキャンバスサイズ入力・プリセット選択が機能すること
