# 44: 選択クリップ範囲のみ再生

現状: Play を押すと `currentTimeMs` からシーケンス末尾 (`seqEnd`) まで全体を通して再生する。特定のクリップだけを確認したい場合に不便。

目標:
- クリップが選択された状態で Play を押すと、そのクリップの範囲 (`clip.startMs` 〜 `clip.startMs + clip.durationMs`) のみ再生する
- クリップ末尾に到達したら再生を停止する
- 停止後に再度 Play を押すと、そのクリップの先頭から再生する
- クリップが未選択の場合は従来通り全体再生

**A. PreviewPlayer の tick() にクリップ範囲制限を追加** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] Props に `selectedClipId: string | null` を追加
- [ ] `selectedClipId` が非 null の場合、シーケンス末尾の代わりに選択クリップの末尾を再生終了ポイントとして使用
  - tick() 内の `seqEnd` を `selectedClipEndMs` に置き換える
  - `selectedClipEndMs = selectedClip.startMs + selectedClip.durationMs`
- [ ] 選択クリップの検索: `findClipInSequence(project.sequence, selectedClipId)` を使用
  - 見つからない場合 (クリップが削除された等) はフォールバックとして全体再生

**B. Play ボタンの挙動変更** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] Play 押下時の先頭リセット判定を修正:
  - クリップ選択中: `currentTimeMs >= selectedClipEndMs` の場合、`onTimeUpdate(selectedClip.startMs)` でクリップ先頭にリセット
  - クリップ未選択: 従来通り `currentTimeMs >= seqEnd` で `onTimeUpdate(0)` (シーケンス先頭)

**C. 選択解除時の挙動**
- [ ] 再生中にクリップ選択を解除 (`selectedClipId` が null に変化) した場合、再生を継続して全体再生モードに切り替え
  - tick() 内で `selectedClipId` が null になったら終了ポイントを `seqEnd` に戻す

## Phase 13 Tasks — プロジェクト設定とタイムライン制約

### 現状の課題

- プロジェクト全体の設定を管理する場所がない
- タイムラインの長さはクリップ配置から動的に計算されており、動画全体の目標尺を制御できない
- クリップをいくらでも長い位置に配置でき、意図しない長尺動画になるリスクがある

### 目標

- プロジェクト設定として「動画時間 (duration)」を管理する
- デフォルト値は 10 秒 (10000ms)
- タイムライン UI にこの時間制限を反映し、制限を超える位置へのクリップ配置・移動・トリムを防止する
- エディタの右ペインに「Settings」タブを追加し、動画時間を変更できるようにする
