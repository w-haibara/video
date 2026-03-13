# 113: プレビューレンダラーのトラック間レイヤー合成対応

**背景:** プレビューレンダラーは現在、トラック種別ごとに 1 つのアクティブクリップを検索して描画している。レイヤーモデルでは、全トラックを下（インデックス 0）から上へ走査し、同一時間帯のアクティブな映像クリップをすべて合成して描画する必要がある。合成方法は各クリップの `blendMode` に基づく `CompositeStrategy` で決定する。

**対象ファイル:**
- `app/frontend/src/lib/preview-renderer-registry.ts`（findActiveClipInTracks の変更）
- `app/frontend/src/components/PreviewPlayer.tsx`（レイヤー合成描画の変更）
- `app/frontend/src/components/renderers/VideoClipRenderer.tsx`（複数クリップ対応）
- `app/frontend/src/components/renderers/ImageClipRenderer.tsx`（複数クリップ対応）
- `app/frontend/src/components/renderers/TextOverlayRenderer.tsx`（clipKind ベース検索対応）
- `app/frontend/src/lib/builtin-plugin.ts`（レンダラー登録変更）

**変更内容:**

**A. findActiveClipInTracks の変更**

- [x] 現在の `trackKind` フィルタを `clipKind` フィルタに変更する
- [x] 複数のアクティブクリップを返す `findAllActiveClips(project, timeMs, clipKind?, assetKind?): ActiveClip[]` を追加する
- [x] 結果はトラック順序（インデックス昇順 = 下から上）で返す

**B. PreviewPlayer のレイヤー合成描画**

- [x] 映像レンダラー（Video / Image）を各トラックの全アクティブクリップに対して描画するように変更する
- [x] 描画順: トラックインデックス 0（最下層）から順に描画し、DOM の z-index でレイヤーを実現する
- [x] 各クリップの `blendMode` に応じて `compositeStrategyRegistry.get(blendMode)` から CSS スタイルを取得し適用する
- [x] テキストオーバーレイは最上位に描画する（従来通り）

**C. VideoClipRenderer / ImageClipRenderer の変更**

- [x] 単一クリップではなく、アクティブクリップの配列を受け取るように変更する
- [x] 各クリップを独立した `<div>` / `<video>` / `<img>` として描画する

**D. TextOverlayRenderer の変更**

- [x] `track.kind === "title"` ではなく `clip.clipKind === "title"` でテキストクリップを検索するように変更する

**E. 再生制御の変更**

- [x] 複数の動画クリップが同時にアクティブな場合、最上位の動画クリップの `<video>` 要素を基準に再生進行を制御する
- [x] `videoRef` の管理を複数動画対応に拡張する（最上位の動画に追従）

**確認方法:** 2 つのトラックに動画クリップを配置し、重なり部分で上トラックの映像が下トラックを覆い隠すこと。重なりのない部分では各トラックの映像が独立して表示されること。
