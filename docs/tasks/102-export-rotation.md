# 102: エクスポートへの clip.transform.rotation 反映

**背景:** プレビューでは CSS `rotate()` により回転が正しく表示されるが、エクスポート時に `buildTransformFilter()` が `clip.transform.rotation` を無視しており、出力動画に回転が反映されない。FFmpeg の `rotate` フィルタを生成する必要がある。

**対象ファイル:**
- `app/backend/src/services/export-service.ts`（`buildTransformFilter` の修正）

**変更内容:**

**A. `buildTransformFilter` に回転フィルタを追加**

- [x] `clip.transform.rotation` を取得し、0 以外の場合に FFmpeg フィルタを生成する
- [x] FFmpeg の `rotate` フィルタを使用してラジアン単位で角度を指定する:
  ```
  rotate=<angle_in_radians>:ow=rotw(<angle_in_radians>):oh=roth(<angle_in_radians>):c=black
  ```
  - `rotate` フィルタは入力をラジアン単位で受け取るため `rotation * PI / 180` に変換する
  - `ow=rotw(a):oh=roth(a)` で回転後のバウンディングボックスにフィット
  - `c=black` で回転で生じた余白を黒埋め
- [x] 回転後にキャンバスサイズへのリサイズ（pad + crop）を適用する:
  ```
  pad=w='max(iw,<width>)':h='max(ih,<height>)':x=(ow-iw)/2:y=(oh-ih)/2:color=black,
  crop=<width>:<height>:(iw-<width>)/2:(ih-<height>)/2
  ```
- [x] 回転は scale/translate より先に適用する（既存の scale → translate の順序の前に rotate を挿入）
- [x] `rotation === 0` の場合はフィルタを追加しない（既存動作を維持）

**B. 早期リターン条件の更新**

- [x] 現在の早期リターン条件 `tx === 0 && ty === 0 && scale === 1` に `rotation === 0` を追加する:
  ```typescript
  const rotation = clip.transform?.rotation ?? 0;
  if (tx === 0 && ty === 0 && scale === 1 && rotation === 0) return "";
  ```

**確認方法:**
- Rotation を指定したクリップをエクスポートし、出力動画に回転が正しく反映されること
- 90°/180°/270° および任意角度（例: 45°, -30°）で正しく動作すること
- Rotation 未指定のクリップのエクスポートに影響がないこと
