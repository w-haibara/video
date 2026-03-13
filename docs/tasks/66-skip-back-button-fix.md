# 66: ⏮ ボタンの動作変更: 先頭シークのみ（再生開始しない）

現状: `PreviewPlayer.tsx` の ⏮ ボタンは `onTimeUpdate(0)` で先頭にシーク後、`setTimeout(() => onPlayPause(), 0)` で自動再生を開始する。

目標: ⏮ ボタンは先頭フレーム (0ms) にシークするのみで、再生は開始しない。再生中に押した場合は再生を停止してから先頭にシークする。

**A. ⏮ ボタンの onClick ハンドラー変更** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] 現在のハンドラー:
  ```tsx
  onClick={() => {
    if (isPlaying) {
      onPlayPause(); // stop first
    }
    onSelectClip(null);
    onTimeUpdate(0);
    setTimeout(() => onPlayPause(), 0); // ← 自動再生
  }}
  ```
- [x] 変更後:
  ```tsx
  onClick={() => {
    if (isPlaying) {
      onPlayPause(); // 再生中なら停止
    }
    onSelectClip(null); // クリップ選択解除（全体再生モード）
    onTimeUpdate(0);    // 先頭にシーク
    // 再生は開始しない
  }}
  ```
- [x] `setTimeout(() => onPlayPause(), 0)` の行を削除

**B. ボタンの title 属性変更** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] `title="Play from start"` → `title="Go to start"` に変更（動作に合わせた説明）
