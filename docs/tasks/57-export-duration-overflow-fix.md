# 57: エクスポートが project settings の動画時間を超過するバグ修正

現状: `buildExportArgs()` (`app/backend/src/services/export-service.ts`) はビデオトラックの全クリップの `durationMs` を単純合算してエクスポートしており、`project.settings.durationMs` を一切参照していない。ユーザーが Settings で動画時間を 6 秒に設定しても、タイムライン上の全クリップ（例: 3 秒 × 6 本 = 18 秒）がそのまま出力される。

目標: エクスポート結果の動画長が `project.settings.durationMs` を超えないようにする。

**A. buildExportArgs でプロジェクト設定の durationMs を適用** (`app/backend/src/services/export-service.ts`)
- [ ] `project.settings.durationMs` を取得し、エクスポートの最大時間とする
- [ ] クリップのフィルタリング: `clip.startMs >= projectDurationMs` のクリップを除外
- [ ] クリップのトリム: `clip.startMs + clip.durationMs > projectDurationMs` の場合、`durationMs` を `projectDurationMs - clip.startMs` にクランプ
- [ ] concat の `n=` パラメータを除外後のクリップ数に更新
- [ ] テキストオーバーレイも同様に `projectDurationMs` 以降を除外

**B. startExport の totalDurationMs 計算を修正** (`app/backend/src/services/export-service.ts`)
- [ ] `totalDurationMs` を `Math.min(clipSum, project.settings.durationMs)` に変更（プログレスバー精度向上）

**C. テスト追加** (`app/backend/src/services/export-service.test.ts`)
- [ ] プロジェクト設定 6000ms、クリップ合計 18000ms → 出力が 6000ms 分に制限されることを検証
- [ ] 境界をまたぐクリップが正しくトリムされることを検証
- [ ] 設定時間外のクリップが除外されることを検証
