# 54: クリップ開始位置の数値入力

現状: InspectorPanel の `<Row label="Start" value={formatMs(clip.startMs)} />` は読み取り専用。タイムライン上のドラッグ移動でしか `startMs` を変更できない。

目標: インスペクタから `startMs` を数値入力で変更でき、タイムライン上のクリップ位置がリアルタイムに更新される。

**A. Start 行を編集可能にする** (`app/frontend/src/components/InspectorPanel.tsx`)
- [ ] `<Row label="Start" value={formatMs(clip.startMs)} />` を `TrimEditor` と同様の数値入力フィールドに変更
  - 秒単位の入力 (小数第 1 位まで、step=0.1)
  - `useState` で入力値を管理、`onBlur` / `Enter` キーでコミット
- [ ] InspectorPanel の props に `onMoveClip?: (clipId: string, newStartMs: number) => void` を追加
- [ ] 値変更時: `onMoveClip(clip.id, newStartMs)` を呼ぶ
  - これにより `sequence-ops.moveClip()` 経由で重なり防止・maxDurationMs 制約が適用される

**B. EditorPage からの接続** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] InspectorPanel に `onMoveClip` を渡す
  - `useProjectEditor` の `moveClip` を使用
- [ ] EditorMainPanel 経由で props を伝播

**C. バリデーション**
- [ ] startMs >= 0
- [ ] startMs + clip.durationMs <= project.settings.durationMs (タイムライン制約)
- [ ] 不正な値の場合は入力を元の値に戻す
- [ ] 同一トラック内の重なり防止は `moveClip()` のロジックで自動適用される
