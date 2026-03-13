# 50: 同一トラック内のクリップ重なり防止

現状: `moveClip()` は `startMs >= 0` と `startMs + durationMs <= maxDurationMs` の制約のみ適用しており、同一トラック内のクリップ間の重なりを検出・防止していない。クリップを別のクリップ上にドラッグすると、重なった状態で配置される。

目標: クリップをドラッグ移動する際、同一トラック内の他のクリップと重ならないようにする。後ろから近づけた場合、前のクリップの末尾にピッタリくっついた位置で停止する (スナップ動作)。

**A. moveClip にクリップ衝突回避ロジックを追加** (`app/frontend/src/lib/sequence-ops.ts`)
- [ ] `moveClip()` 内でクリップ移動後の位置を計算した後、同一トラック内の他のクリップとの重なりを検出
- [ ] 衝突回避アルゴリズム:
  1. 移動対象クリップの新しい範囲: `[newStartMs, newStartMs + clip.durationMs)`
  2. 同一トラック内の他のクリップを走査
  3. 重なるクリップが見つかった場合:
     - **右方向から近づいた場合** (移動先が前のクリップと重なる): `newStartMs = prevClip.startMs + prevClip.durationMs` (前のクリップの末尾にスナップ)
     - **左方向から近づいた場合** (移動先が後ろのクリップと重なる): `newStartMs = nextClip.startMs - clip.durationMs` (後ろのクリップの先頭にスナップ)
  4. スナップ後も別のクリップと重なる場合は移動をキャンセル (元の位置を維持)

**B. 衝突検出ヘルパー関数** (`app/frontend/src/lib/sequence-ops.ts`)
- [ ] `findNonOverlappingPosition(clips, movingClipId, newStartMs, durationMs): number` を追加
  - 他のクリップの範囲を確認し、重ならない最寄りの位置を返す
  - 左側の最も近いクリップの末尾と、右側の最も近いクリップの先頭の間に収まるようにクランプ

**C. テストの追加** (`app/frontend/src/lib/sequence-ops.test.ts`)
- [ ] クリップを別のクリップ上に移動しようとした場合、前のクリップ末尾にスナップすることを検証
- [ ] クリップ間に十分なスペースがある場合は自由に移動できることを検証
- [ ] 3つ以上のクリップがある場合の中間位置への移動テスト
