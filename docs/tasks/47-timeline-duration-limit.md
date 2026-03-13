# 47: タイムライン UI への動画時間制限の反映

タイムラインの表示と操作に動画時間の上限を適用する。

**A. タイムライン表示幅の固定** (`app/frontend/src/components/Timeline.tsx`)
- [x] `getTimelineDuration()` を `project.settings.durationMs` ベースに修正
- [x] タイムラインに終端マーカー (dashed red line) を表示

**B. クリップ追加時の制約** (`app/frontend/src/lib/sequence-ops.ts`)
- [x] `addClipFromAsset()` に `maxDurationMs` 引数追加、クランプ・拒否ロジック実装
- [x] `addTextClip()` にも同様の制約追加

**C. クリップ移動時の制約**
- [x] `moveClip()` に `maxDurationMs` 引数追加、startMs クランプ実装

**D. クリップトリム時の制約**
- [x] `trimClip()` に `maxTimelineDurationMs` 引数追加、右トリムのクランプ実装

**E. useProjectEditor への制約伝播**
- [x] 全操作関数に `project.settings.durationMs` を渡すよう更新

**F. ドラッグ移動のビジュアルフィードバック** (`app/frontend/src/components/TimelineClip.tsx`)
- [x] ドラッグ中のプレビュー位置を `maxDurationMs - clip.durationMs` でクランプ
