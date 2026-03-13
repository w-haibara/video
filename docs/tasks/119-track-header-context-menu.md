# 119: トラックヘッダー右クリックメニュー + 確認ダイアログ付きトラック削除

**背景:** トラックヘッダー（「1」「2」...の番号表示部分）を右クリックしたときにコンテキストメニューを表示し、「トラックを削除」操作を提供する。削除時には確認ダイアログを表示し、誤操作を防止する。GoF の Command パターンに沿い、トラック操作（削除）をコールバック経由で実行し、undo/redo システム（pushState）に統合する。ContextMenu コンポーネントは既存のものを再利用する（Open/Closed 原則: 新しいメニュー項目の追加のみ）。

**対象ファイル:**
- `app/frontend/src/components/ConfirmDialog.tsx`（新規 — 確認ダイアログコンポーネント）
- `app/frontend/src/components/TimelineTrack.tsx`（トラックヘッダーに onContextMenu 追加）
- `app/frontend/src/components/Timeline.tsx`（トラック右クリックメニュー状態管理・ConfirmDialog 統合）
- `app/frontend/src/pages/EditorPage.tsx`（onDeleteTrack ハンドラ追加）

**変更内容:**

**A. ConfirmDialog コンポーネントの新規作成**

- [x] `ConfirmDialog` コンポーネントを作成する（props: `message`, `onConfirm`, `onCancel`）
- [x] モーダルオーバーレイ付きの確認ダイアログ UI を実装する（「OK」「キャンセル」ボタン）
- [x] Escape キーでキャンセルできるようにする
- [x] テーマ変数を使用してスタイリングする

**B. TimelineTrack のトラックヘッダー右クリック対応**

- [x] TimelineTrack の Props に `onTrackContextMenu?: (trackId: string, position: { x: number; y: number }) => void` を追加する
- [x] トラックヘッダー div に `onContextMenu` ハンドラを追加する
- [x] 右クリック時に `onTrackContextMenu(track.id, { x, y })` を呼び出す

**C. Timeline のトラック右クリックメニュー管理**

- [x] トラック右クリック用の state を追加する: `trackContextMenu: { trackId: string; x: number; y: number } | null`
- [x] 既存の `ContextMenu` コンポーネントを再利用し、「Delete Track」メニュー項目を表示する
- [x] 「Delete Track」クリック時に ConfirmDialog を表示する
- [x] ConfirmDialog で「OK」を選択した場合に `onDeleteTrack(trackId)` を呼び出す

**D. Timeline の Props 拡張**

- [x] `onDeleteTrack?: (trackId: string) => void` を Props に追加する

**E. EditorPage のトラック削除ハンドラ**

- [x] `handleDeleteTrack` を追加し、`removeTrack(sequence, trackId)` を呼び出して `pushState` する
- [x] Timeline に `onDeleteTrack={handleDeleteTrack}` を渡す

**確認方法:** トラックヘッダーを右クリックするとコンテキストメニューが表示されること。「Delete Track」をクリックすると確認ダイアログが表示されること。「OK」でトラックが削除されること。「キャンセル」で何も起きないこと。削除が undo/redo で復元できること。
