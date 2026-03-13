# 105: シークバーの画面下端延長 + トラック下部空白クリックシーク

**背景:** 現在のタイムライン UI では、プレイヘッド（シークバー）の縦線が最後のトラック行までしか描画されず、トラック下部の空白スペースではクリック・ドラッグによるシーク操作ができない。シークバーをタイムライン領域の下端まで延長し、空白領域でもクリック・ドラッグでシーク可能にすることで操作性を向上させる。

**対象ファイル:**
- `app/frontend/src/components/Timeline.tsx`（レイアウト・イベント修正）

**変更内容:**

**A. タイムライン内コンテナの高さをスクロール領域全体に拡張**

- [x] スクロール領域内の内側コンテナ（`position: relative` の div）に `display: "flex"`, `flexDirection: "column"`, `minHeight: "100%"` を追加し、スクロール領域の高さいっぱいに広げる
- [x] "Seek bar + Tracks wrapper"（`position: relative` の div）に `flex: 1` を追加し、トラック下部の残りスペースを埋める
- [x] これにより `Playhead` コンポーネント（`position: absolute`, `top: 0`, `bottom: 0`）が自動的にタイムライン領域の下端まで描画される

**B. トラック下部の空白領域でクリック・ドラッグシークを有効化**

- [x] "Seek bar + Tracks wrapper" div に `onMouseDown={handleRulerMouseDown}` を追加する
- [x] `TimelineClip` の `handleMouseDown` は既に `e.stopPropagation()` を呼んでいるため、クリップ上のクリックではシークが発動しないことを確認する
- [x] 空白領域のカーソルを `col-resize` に設定する（`cursor: "col-resize"` を wrapper に追加）

**確認方法:**
- タイムラインのプレイヘッド縦線がトラック下部の空白領域まで描画されること
- トラック下部の空白領域を左クリックするとその位置にシークすること
- 空白領域をドラッグするとシーク位置がマウスに追従すること
- クリップのクリック・ドラッグ操作（移動・トリム・選択）が従来通り動作すること
