# 48: テストの追加

**A. sequence-ops テスト** (`app/frontend/src/lib/sequence-ops.test.ts`)
- [x] `addClipFromAsset` に `maxDurationMs` を指定: クランプ、拒否、制約なしの 4 テスト
- [x] `moveClip` に `maxDurationMs` を指定: 移動可、クランプ、オーバーフローの 3 テスト
- [x] `trimClip` に `maxTimelineDurationMs` を指定: タイムライン制約、ソース+タイムライン複合制約の 2 テスト
- [x] `addTextClip` に `maxDurationMs` を指定: クランプ、拒否、制約なしの 3 テスト

**B. 型の整合性確認**
- [x] `Project` 型で `settings` が必須フィールドであることを TypeScript コンパイルで確認 (既存テストが型チェックを通過)
- [x] `createProject` が `settings.durationMs = 10_000` で初期化されることを検証 (project-service.test.ts に追加)

## Phase 14 Tasks — 再生・操作性・インポート改善
