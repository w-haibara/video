import type { Asset } from "./asset";

export type ProjectSettings = {
  durationMs: number; // 動画全体の目標尺 (ミリ秒)
  canvasWidth: number; // キャンバス幅 (px)
  canvasHeight: number; // キャンバス高さ (px)
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
  clips: Clip[];
  name?: string;
  color?: string;
  locked?: boolean;
  muted?: boolean;
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

/** Built-in transition types. ClipTransition.type accepts any string for plugins. */
export type BuiltinTransitionType =
  | "fade" | "fade-black" | "fade-white"
  | "slide-left" | "slide-right" | "slide-up" | "slide-down";

export type ClipTransition = {
  type: string;
  durationMs: number;
};

/** Built-in clip kinds. The Clip.clipKind field accepts any string. */
export type BuiltinClipKind = "video" | "audio" | "title" | "image";

/** Built-in blend modes. The Clip.blendMode field accepts any string. */
export type BuiltinBlendMode = "cover" | "opacity" | "multiply" | "screen" | "overlay" | "add" | "difference";

export type Clip = {
  id: string;
  clipKind: string;
  assetId: string;
  startMs: number; // タイムライン上の開始位置
  durationMs: number; // クリップの表示/再生時間
  inMs: number; // 素材のトリムイン
  outMs: number; // 素材のトリムアウト
  text?: ClipText;
  volume?: number; // 0.0 - 1.0
  transform?: ClipTransform;
  crop?: ClipCrop;
  blendMode?: string; // 省略時は "cover" として扱う
  transition?: ClipTransition; // このクリップの先頭に適用されるトランジション
  groupId?: string; // グループID（同じgroupIdを持つクリップは一緒に選択される）
};

export type ExportPreset = {
  width: number;
  height: number;
  fps: number;
  videoBitrate: string;
  audioBitrate: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
};
