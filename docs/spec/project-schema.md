# Project Schema

## 概要

- 編集状態は `project.json` を正本とする
- UIの状態やCanvas描画から逆算しない
- preview / export はすべて project.json から生成する
- 自動保存: 変更ごと（debounce付き）
- 1プロジェクト = 1シーケンス（タイムライン）

## Undo / Redo

- project.json のスナップショットを履歴スタックとして保持
- フロントエンド側のメモリ上で管理
- ディスクへの永続化は最新状態のみ

## データモデル

```ts
type Project = {
  id: string;
  name: string;
  version: 1;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  assets: Asset[];
  sequence: Sequence;
  exportPreset: ExportPreset;
};

type Asset = {
  id: string;
  kind: "video" | "image" | "audio";
  originalPath: string;   // workspace内の相対パス
  proxyPath?: string;      // workspace内の相対パス
  thumbnailPath?: string;  // workspace内の相対パス
  width?: number;
  height?: number;
  durationMs?: number;
  rotation?: number;       // ffprobeから取得した元の回転値
  codec?: string;
  colorSpace?: string;
  hasAudio?: boolean;
  importedAt: string;      // ISO 8601
};

type Sequence = {
  id: string;
  width: number;   // 出力解像度
  height: number;
  fps: number;     // 固定 30
  tracks: Track[];
};

type Track = {
  id: string;
  kind: "video" | "audio" | "text";
  clips: Clip[];
};

type Clip = {
  id: string;
  assetId?: string;        // text clipでは不要
  startMs: number;         // タイムライン上の絶対位置
  durationMs: number;      // タイムライン上の表示時間
  sourceInMs?: number;     // 動画素材のトリム開始点
  sourceOutMs?: number;    // 動画素材のトリム終了点
  transform?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;      // ユーザーによる追加回転
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text?: {
    value: string;
    fontFamily: string;    // OS標準フォント
    fontSize: number;
    align: "left" | "center" | "right";
    color: string;         // hex
    backgroundColor: string; // 背景帯の色 hex
  };
  volume?: number;         // 0.0 - 1.0
};

type ExportPreset = {
  container: "mp4";
  videoCodec: "h264";
  audioCodec: "aac";
  width: number;
  height: number;
  fps: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
};
```

## Clip.startMs の仕様

- タイムライン上の絶対位置（ms単位）
- クリップ間にギャップを持てる
- オーバーラップは禁止（同一track内）
- フロントエンドでバリデーションする

## 静止画クリップ

- `durationMs` でタイムライン上の表示時間を指定
- デフォルト: 3000ms（3秒）
- `sourceInMs` / `sourceOutMs` は使用しない

## 音声クリップ（BGM）

- audioトラックに配置
- `startMs` で開始位置を指定
- `durationMs` で再生時間を指定
- フェードなし（MVPスコープ外）
- `volume` で音量調整のみ
