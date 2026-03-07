import type { Asset } from "./asset";

export type Project = {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  assets: Asset[];
  sequence: Sequence;
};

export type Sequence = {
  tracks: Track[];
};

export type Track = {
  id: string;
  kind: "video" | "audio" | "title";
  clips: Clip[];
};

export type Clip = {
  id: string;
  assetId: string;
  startMs: number; // タイムライン上の開始位置
  durationMs: number; // クリップの表示/再生時間
  inMs: number; // 素材のトリムイン
  outMs: number; // 素材のトリムアウト
};

export type ExportPreset = {
  width: number;
  height: number;
  fps: number;
  videoBitrate: string;
  audioBitrate: string;
};
