import type { Asset } from "./asset";

export type ProjectSettings = {
  durationMs: number; // 動画全体の目標尺 (ミリ秒)
};

export type Project = {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  assets: Asset[];
  sequence: Sequence;
  settings: ProjectSettings;
  exportPreset?: ExportPreset;
};

export type Sequence = {
  tracks: Track[];
};

export type Track = {
  id: string;
  kind: "video" | "audio" | "title";
  clips: Clip[];
};

export type ClipText = {
  value: string;
  fontFamily?: string;
  fontSize?: number;
  align?: "left" | "center" | "right";
  color?: string;
  backgroundColor?: string;
};

export type ClipTransform = {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
};

export type ClipCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Clip = {
  id: string;
  assetId: string;
  startMs: number; // タイムライン上の開始位置
  durationMs: number; // クリップの表示/再生時間
  inMs: number; // 素材のトリムイン
  outMs: number; // 素材のトリムアウト
  text?: ClipText;
  volume?: number; // 0.0 - 1.0
  transform?: ClipTransform;
  crop?: ClipCrop;
};

export type ExportPreset = {
  width: number;
  height: number;
  fps: number;
  videoBitrate: string;
  audioBitrate: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
};
