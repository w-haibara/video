# 85: iPhone MOV 未対応コーデックストリームへの対策

**背景:** iPhone 16 Pro Max で撮影した MOV ファイルには以下のような複数ストリームが含まれる:
- Stream 0: HEVC (Main 10) 映像
- Stream 1: AAC 音声（メイン）
- Stream 2: APAC 音声（Apple Positional Audio Codec — 空間オーディオ）
- Stream 3-8: メタデータ (mebx)

FFmpeg 4.4.2 は APAC コーデックをサポートしておらず、以下の警告が出る:
```
Could not find codec parameters for stream 2 (Audio: none (apac / 0x63617061), 48000 Hz, 4 channels, 380 kb/s): unknown codec
```

現在の `filter_complex` は `[i:v]` / `[i:a]` で最初の映像・音声ストリームを正しく選択しており、APAC ストリームは実質的に無視されるが、警告が stderr に出力されノイズとなる。また、HEVC Dolby Vision メタデータ（NAL unit 62）のスキップ警告も大量に出る。

**対象ファイル:**
- `app/backend/src/services/export-service.ts`

**変更内容:**

**A. FFmpeg 入力オプションの追加** (`buildExportArgs` の inputArgs 構築部分)
- [ ] 動画アセットの `-i` の前に `-ignore_unknown` オプションを追加し、未対応コーデックストリームの警告を抑制する
- [ ] 現在のコード (L128):
  ```typescript
  inputArgs.push("-i", assetPath);
  ```
- [ ] 修正後:
  ```typescript
  inputArgs.push("-ignore_unknown", "-i", assetPath);
  ```

**B. stderr ログの改善** (`startExport` のエラーハンドリング)
- [ ] エクスポート失敗時の stderr 出力から `[hevc @...] Skipping NAL unit` 行をフィルタリングし、ユーザーに表示されるエラーメッセージのノイズを削減する
- [ ] 現在のコード (L386-389):
  ```typescript
  const stderr = proc.stderr
    ? await new Response(proc.stderr).text()
    : "";
  throw new Error(`Export failed (exit ${exitCode}): ${stderr}`);
  ```
- [ ] 修正後:
  ```typescript
  const rawStderr = proc.stderr
    ? await new Response(proc.stderr).text()
    : "";
  const stderr = rawStderr
    .split("\n")
    .filter((line) => !line.includes("Skipping NAL unit"))
    .join("\n");
  throw new Error(`Export failed (exit ${exitCode}): ${stderr}`);
  ```

**確認方法:**
- iPhone MOV ファイルを含むプロジェクトのエクスポートで APAC 関連の警告が出ないこと
- エクスポート失敗時のエラーメッセージから NAL unit スキップ行が除去されていること
- 通常のファイル（APAC ストリームなし）のエクスポートに影響がないこと
