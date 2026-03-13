# 51: アセットインポート完了前のクリップ追加防止とサムネイル表示改善

現状の問題:
1. アセットをインポートした直後、バックグラウンドジョブ (ffprobe + proxy/thumbnail 生成) が完了するまで `asset.thumbnailPath` と `asset.proxyPath` が `undefined`。この状態でサムネイルが表示されず kind ラベル ("video" 等) のみ表示される。
2. ジョブ完了前に「+ Add to Timeline」を押すと、`asset.durationMs` が `undefined` のため `DEFAULT_IMAGE_DURATION_MS (3000ms)` がフォールバックとして使われ、不正確なクリップが作成される。ジョブ完了後に正しい duration に更新されない。
3. ジョブ完了後、プロジェクトの再フェッチが行われないため、サムネイルが表示されない場合がある。

**A. ジョブ未完了アセットの「Add to Timeline」ボタンを無効化** (`app/frontend/src/components/AssetPanel.tsx`)
- [ ] `AssetThumbnail` コンポーネントの「+」ボタンに `disabled` 条件を追加
  - ジョブが進行中 (`job.status` が `"pending"` or `"running"`) の場合はボタンをグレーアウト
  - ジョブが完了 (`"completed"`) の場合のみクリック可能
  - ジョブがない (`jobId` が null) かつ `asset.durationMs` が設定済みの場合も有効 (既に完了済みのアセット)
- [ ] ボタンの disabled スタイル: `opacity: 0.4`, `cursor: not-allowed`

**B. ジョブ完了後のプロジェクト再フェッチ** (`app/frontend/src/components/AssetPanel.tsx`)
- [ ] ジョブ完了 (`job.status === "completed"`) を検出したら `queryClient.invalidateQueries(["projects", projectId])` を呼び出す
  - これにより `useProject` が再フェッチされ、更新された asset (thumbnailPath, proxyPath, durationMs) が取得される
  - `useEffect` で各アクティブジョブの status を監視し、completed 変化時に refetch をトリガー

**C. アクティブジョブの永続化改善** (`app/frontend/src/components/AssetPanel.tsx`)
- [ ] 現在 `activeJobIds` は `useState` で管理されており、ページ遷移やリロードで失われる
  - アセットの `thumbnailPath` が undefined のアセットについて、初回レンダー時にバックエンドから最新のジョブ情報を取得する
  - または、アセットの `thumbnailPath` の有無でジョブ完了を判定し、ジョブ ID 管理を不要にする

**D. AssetThumbnail のローディング表示改善** (`app/frontend/src/components/AssetThumbnail.tsx`)
- [ ] ジョブ進行中: スピナーまたはプログレスバーを表示 (既存の JobProgress を使用)
- [ ] ジョブ完了でサムネイルがまだ表示されない場合: 「Processing...」表示
- [ ] サムネイルがある場合: 画像を表示 (現状通り)

## Phase 15 Tasks — インスペクタ機能強化

### 現状の課題

1. **Crop の初期値問題**: Crop の W/H がハードコード `100` で初期化されている。元動画のサイズ (`asset.width/height`) がアセットメタデータとして取得済みなのに活用されていない
2. **クリップの位置・拡大縮小**: `ClipTransform` 型に `x`, `y`, `scale` フィールドが定義済みだが、UI (InspectorPanel) もプレビュー描画 (PreviewPlayer) もエクスポート (export-service) も未実装。回転のみ対応
3. **クリップ開始位置の数値入力**: `startMs` は InspectorPanel に読み取り専用テキストで表示されるのみ。タイムライン上のドラッグでしか変更できない
