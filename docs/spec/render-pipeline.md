# Render Pipeline

## 概要

メディア処理はすべてBunサーバーからFFmpeg/ffprobeを `Bun.spawn()` で呼び出す。
シェル文字列結合は禁止し、引数配列で起動する。

## パイプライン

### 1. メタデータ抽出

```
ffprobe -v quiet -print_format json -show_format -show_streams <input>
```

取得項目:
- 解像度 (width, height)
- 再生時間 (duration)
- コーデック (codec_name)
- 回転 (rotation / side_data の displaymatrix)
- 音声の有無
- カラースペース (color_space, color_transfer)

### 2. サムネイル生成

```
ffmpeg -i <input> -vf "scale=640:-2" -frames:v 1 -q:v 5 <output.jpg>
```

- 動画: 先頭フレームを抽出
- 静止画 (HEIC含む): JPEG変換

### 3. Proxy生成（動画）

```
ffmpeg -i <input> \
  -vf "scale=1280:-2,fps=30" \
  -c:v libx264 -preset fast -crf 28 \
  -c:a aac -b:a 128k -ar 48000 \
  -movflags +faststart \
  <output.mp4>
```

- VFR → 固定30fps
- HDR → SDR: `-vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"` を追加
- 回転: FFmpegの autorotate（デフォルト有効）で正規化

### 4. Proxy生成（静止画 HEIC）

```
ffmpeg -i <input.heic> -q:v 2 <output.jpg>
```

### 5. Export

project.json から FFmpeg filtergraph を組み立てる。

#### 基本フロー

1. 各クリップの trim / scale / rotate を個別に処理
2. concat filter で結合
3. テロップは drawtext filter で overlay
4. BGMは amix で合成
5. 出力エンコード

#### 出力設定

```
-c:v libx264 -preset medium -crf 20
-c:a aac -b:a 192k -ar 48000
-movflags +faststart
```

#### 解像度

| プリセット | 解像度 |
|-----------|--------|
| 720p 16:9 | 1280x720 |
| 720p 9:16 | 720x1280 |
| 720p 1:1 | 720x720 |
| 1080p 16:9 | 1920x1080 |
| 1080p 9:16 | 1080x1920 |
| 1080p 1:1 | 1080x1080 |

## Job管理

### ステータス遷移

```
pending → processing → completed
                    → failed
failed → pending (retry)
```

### Job種別

- `import`: メタデータ抽出 + サムネイル + proxy（一連の処理）
- `export`: 最終書き出し

### 進捗取得

- MVPではポーリング（`GET /api/jobs/:id`）
- ポーリング間隔: 1秒
- FFmpegの進捗は stderr のフレーム数から算出
