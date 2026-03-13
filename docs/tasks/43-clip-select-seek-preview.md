# 43: クリップ選択時のシーク移動とプレビュー表示

現状: タイムラインでクリップをクリックすると `selectedClipId` が設定されるが、プレイヘッド (`currentTimeMs`) は移動しない。プレビューも変化しない。ユーザーはクリップを選択した後、そのクリップの内容を確認するために手動でシークバーを操作する必要がある。

目標: クリップを選択したら、プレイヘッドをそのクリップの先頭 (`clip.startMs`) に移動させ、プレビューにそのクリップの 1 フレーム目を表示する。

原理:
- `currentTimeMs` をクリップの `startMs` に設定すれば、`findActiveClip()` がそのクリップを返し、PreviewPlayer の既存ロジック (非再生時の seek useEffect) が `video.currentTime = clip.inMs / 1000` を設定する
- つまりシーク移動だけで、プレビュー表示は既存の仕組みで自動的に実現される

**A. EditorPage のクリップ選択ハンドラにシーク追加** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `onSelectClip` のコールバックを拡張: クリップ選択時にそのクリップの `startMs` に `onSeek` を呼ぶ
  - `handleSelectClip(clipId: string | null)` を新設
  - `clipId` が非 null の場合: `sequence.tracks` からクリップを検索し、`clip.startMs` を取得して `onSeek(clip.startMs)` を呼ぶ
  - `clipId` が null の場合 (選択解除): シークは変更しない
- [ ] Timeline と EditorMainPanel に渡す `onSelectClip` をこの新ハンドラに差し替え

**B. クリップ検索ヘルパー** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `findClipById(sequence, clipId)` ヘルパーを追加 (全トラックを走査して該当クリップを返す)
- [ ] 見つからない場合はシーク変更なし (安全ガード)

**C. 注意事項**
- [ ] ドラッグ並べ替え中の mousedown でもシークが発生するが、並べ替え操作自体には影響しない (クリップの startMs に移動するだけ)
- [ ] 再生中のクリップ選択ではシークにより再生位置がジャンプする (意図的な挙動)
