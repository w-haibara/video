# Media Support Matrix

## 入力対応

| 形式 | 拡張子 | 対応 | 備考 |
|------|--------|------|------|
| JPEG | `.jpg` `.jpeg` | o | |
| PNG | `.png` | o | |
| HEIF | `.heic` `.heif` | o | FFmpegで変換 |
| MP4 (H.264) | `.mp4` | o | |
| MP4 (H.265/HEVC) | `.mp4` | o | proxy化時にH.264へ変換 |
| MOV (H.264) | `.mov` | o | |
| MOV (HEVC) | `.mov` | o | proxy化時にH.264へ変換 |
| MOV (ProRes) | `.mov` | o | proxy化時にH.264へ変換 |
| HDR素材 | 各種 | o | SDRに変換（tonemap） |
| Live Photos | `.heic` + `.mov` | x | 未対応 |
| Dolby Vision | 各種 | x | 未対応 |
| 音声 (AAC) | `.m4a` `.aac` | o | BGM用 |
| 音声 (MP3) | `.mp3` | o | BGM用 |
| 音声 (WAV) | `.wav` | o | BGM用 |

## 内部処理

| 処理 | 形式 | 備考 |
|------|------|------|
| proxy動画 | H.264 / 720p / 30fps / AAC | ブラウザ互換を最優先 |
| サムネイル | JPEG / 360p | 1クリップにつき1枚 |
| 静止画proxy | JPEG変換 | HEICはJPEGに変換して保持 |

## 出力

| 項目 | 値 |
|------|-----|
| コンテナ | MP4 |
| 映像コーデック | H.264 |
| 音声コーデック | AAC |
| 解像度 | 720p / 1080p（選択） |
| カラースペース | SDR固定 |
| フレームレート | 30fps |

## 特殊処理

### 回転メタデータ

iPhone素材は回転メタデータを持つ場合がある。import時にffprobeで検出し、proxy生成・export時にFFmpeg `autorotate` で正規化する。

### 可変フレームレート (VFR)

iPhoneの動画はVFRの場合がある。proxy生成時に固定30fpsに正規化する。export時も固定fpsで出力する。

### 音声サンプリングレート

素材ごとに異なる可能性がある。export時にFFmpegで48kHzに統一する。
