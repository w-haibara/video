# 95: タイムラインクリップの外観レジストリ化

**背景:** `TimelineClip.tsx` の 42〜53 行目で `isTextClip` / `isAudioClip` による if/else チェーンでクリップの背景色・ボーダー色を決定しており、`TimelineTrack.tsx` の 19〜23 行目で `TRACK_LABEL` のハードコード Record がある。新しいトラック種別を追加するたびにこれらのファイルを修正する必要がある。

**対象ファイル:**
- `app/frontend/src/components/TimelineClip.tsx`
- `app/frontend/src/components/TimelineTrack.tsx`

**変更内容:**

**A. TimelineClip のリファクタリング**

- [x] 42〜53 行目の色決定ロジックを `TrackKindRegistry` からの取得に置換:
  ```typescript
  const descriptor = trackKindRegistry.get(trackKind);
  const bgColor = isSelected ? descriptor?.clipColor : descriptor?.clipSelectedColor;
  const borderColor = isSelected ? theme.text : descriptor?.clipSelectedColor;
  ```
- [x] `TimelineClip` の props に `trackKind: string` を追加（現在は `asset?.kind` と `clip.text` から推測しているため）
- [x] `TimelineTrack` から `trackKind` を `TimelineClip` に渡すように修正

**B. TimelineTrack のリファクタリング**

- [x] 19〜23 行目の `TRACK_LABEL` 定数を削除し、`TrackKindDescriptor.label` を使用:
  ```typescript
  const descriptor = trackKindRegistry.get(track.kind);
  const label = descriptor?.label ?? track.kind[0].toUpperCase();
  ```

**確認方法:**
- タイムラインの見た目が完全に同一であること
- 新しいトラック種別をレジストリに追加するとタイムラインに自動で対応すること
