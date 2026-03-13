# 58: 設定変更時の既存クリップ遡及トリム

現状: `addClipFromAsset()` はクリップ追加時に `maxDurationMs` でクランプするが、プロジェクト設定の `durationMs` を後から短くしても既存クリップは調整されない。結果、タイムライン上にプロジェクト設定を超えるクリップが残り、Task 57 のエクスポート問題の原因となる。

目標: プロジェクト設定の `durationMs` 変更時に既存クリップを自動的にトリム・除外する。

**A. クリップトリム関数の追加** (`app/frontend/src/lib/sequence-ops.ts`)
- [ ] `clampClipsToDuration(sequence, maxDurationMs)` 関数を追加
- [ ] `startMs >= maxDurationMs` のクリップを除外
- [ ] `startMs + durationMs > maxDurationMs` のクリップの `durationMs` と `outMs` をクランプ
- [ ] 空になったトラック（video/audio）は保持（title トラックのクリップも同様にクランプ）

**B. 設定変更時の適用** (`app/frontend/src/hooks/useProjectEditor.ts` or Settings パネル)
- [ ] `project.settings.durationMs` の変更時に `clampClipsToDuration` を呼び出す
- [ ] Undo/Redo スタックに正しく反映されるよう `pushState` 経由で適用

**C. テスト追加** (`app/frontend/src/lib/sequence-ops.test.ts`)
- [ ] 設定短縮で境界をまたぐクリップがトリムされることを検証
- [ ] 設定範囲外のクリップが除外されることを検証
- [ ] title/audio トラックも同様にクランプされることを検証
