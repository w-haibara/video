# 88: プレビューのテキストオーバーレイ位置をエクスポートと一致させる

**背景:** テキストオーバーレイの表示位置がプレビューとエクスポートで異なる。エクスポート側が意図通りの表示であり、プレビュー側を修正する。

**差異の詳細:**

| 項目 | プレビュー | エクスポート |
|------|-----------|-------------|
| 下端からの距離 | `padding: 16px` + `marginBottom: 8px` = 約24px | `y=h-th-40` = 40px |
| デフォルト背景色 | `transparent` | `black@0.5` |
| ボックス余白 | `padding: 4px 12px` | `boxborderw=8`（上下左右8px） |

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.tsx`

**変更内容:**

**A. テキスト垂直位置の修正** (L381-413)

- [ ] テキストオーバーレイコンテナの `padding: "16px"` を `padding: "40px"` に変更
- [ ] 各テキスト要素の `marginBottom: "8px"` を `marginBottom: "0px"` に変更（エクスポートでは複数テキスト間のスペーシングは drawtext の y 座標で固定のため）

**B. デフォルト背景色の修正** (L398)

- [ ] `backgroundColor: text.backgroundColor ?? "transparent"` を `backgroundColor: text.backgroundColor ?? "rgba(0,0,0,0.5)"` に変更
  - エクスポートの `black@0.5` = 不透明度50%の黒に合わせる

**C. ボックス余白の修正** (L401)

- [ ] `padding: "4px 12px"` を `padding: "8px"` に変更
  - エクスポートの `boxborderw=8` は上下左右均等8px

**D. テキストピクセル値のキャンバス解像度スケーリング**

- [x] キャンバスコンテナの描画幅を ResizeObserver で監視し、`canvasScale = renderedWidth / canvasW` を算出
- [x] テキストオーバーレイの fontSize, padding, borderRadius に `canvasScale` を乗算
  - CSS ピクセル値はキャンバスの描画サイズに対するものだが、エクスポートはキャンバスのネイティブ解像度（1920×1080 等）基準のため、スケーリングしないとプレビューでテキストが巨大に表示される

**確認方法:**
- テキストオーバーレイの表示位置がエクスポート結果と一致すること
- 複数テキストクリップが同時表示される場合もレイアウトが一致すること
- カスタム背景色が設定されている場合はそちらが優先されること
- ブラウザウィンドウのリサイズ時にテキストサイズが追従すること
