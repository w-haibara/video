# 117: クリップのトラック間ドラッグ移動 UI

**背景:** タスク 116 で追加した `moveClip` のトラック間移動ロジックを、UI のドラッグ操作で利用できるようにする。現在のクリップドラッグは水平方向のみ（同一トラック内の位置変更）。垂直方向のドラッグを検出し、別トラックへの移動を可能にする。GoF の Observer パターンに沿い、ドラッグ中のトラック変更イベントを Timeline コンポーネントに通知し、Timeline 側で `moveClip` を呼び出す。

**対象ファイル:**
- `app/frontend/src/components/TimelineClip.tsx`（ドラッグ中の垂直移動検出）
- `app/frontend/src/components/TimelineTrack.tsx`（ドラッグ中のトラックハイライト表示）
- `app/frontend/src/components/Timeline.tsx`（トラック間移動コールバックの追加）
- `app/frontend/src/pages/EditorPage.tsx`（ハンドラ接続）
- `app/frontend/src/hooks/useProjectEditor.ts`（moveClip の targetTrackId 対応）

**変更内容:**

**A. Timeline の Props 拡張**

- [x] `onMoveClip` の型を `(clipId: string, newStartMs: number, targetTrackId?: string) => void` に拡張する
- [x] Timeline 内でトラック間移動時に `targetTrackId` を渡してコールバックを呼び出す

**B. TimelineClip のドラッグ拡張**

- [x] `onMove` の型に `targetTrackId` を追加する: `(clipId: string, newStartMs: number, targetTrackId?: string) => void`
- [x] ドラッグ中にマウスの Y 座標変位を追跡し、トラック高さ（40px）を超えた場合にトラック間移動と判定する
- [x] ドラッグ中の移動先トラックインデックスを算出し、`onMove` に `targetTrackId` として渡す

**C. ドラッグ中のビジュアルフィードバック**

- [x] ドラッグ中の移動先トラックをハイライト表示する（背景色を `theme.bgHover` に変更）
- [x] クリップが元トラックから離れたことを半透明表示で示す

**D. EditorPage・useProjectEditor の接続**

- [x] `useProjectEditor.moveClip` に `targetTrackId` 引数を追加する
- [x] `EditorPage` のハンドラを更新して `targetTrackId` を `moveClip` に渡す

**確認方法:** クリップを上下にドラッグして別トラックに移動できること。移動先トラックで重なり防止が機能すること。元トラックが空になった場合に自動削除されること。
