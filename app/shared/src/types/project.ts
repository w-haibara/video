import type { Asset } from "./asset";
import type { KeyframeTrack } from "./keyframe";

export type ProjectSettings = {
  durationMs: number; // 動画全体の目標尺 (ミリ秒)
  canvasWidth: number; // キャンバス幅 (px)
  canvasHeight: number; // キャンバス高さ (px)
};

export type Marker = {
  id: string;
  timeMs: number;
  label?: string;
  color?: string;
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
  markers?: Marker[];
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

export type ClipColorCorrection = {
  brightness?: number;   // -1.0 to 1.0 (0 = no change)
  contrast?: number;     // -1.0 to 1.0 (0 = no change)
  saturation?: number;   // -1.0 to 1.0 (0 = no change)
  hue?: number;          // -180 to 180 degrees (0 = no change)
  temperature?: number;  // -1.0 to 1.0 (0 = no change, warm/cool)
};

/** Built-in video filter types. VideoFilter.type accepts any string for plugins. */
export type BuiltinVideoFilterType = "blur" | "sharpen" | "vignette" | "grain" | "sepia" | "grayscale";

export type VideoFilter = {
  type: string;      // filter type (see BuiltinVideoFilterType)
  strength: number;  // 0.0 to 1.0
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
  speed?: number; // playback speed multiplier, default 1.0 (0.25–4.0)
  groupId?: string; // グループID（同じgroupIdを持つクリップは一緒に選択される）
  keyframeTracks?: KeyframeTrack[];
  colorCorrection?: ClipColorCorrection;
  videoFilters?: VideoFilter[];
};

export type ExportPreset = {
  width: number;
  height: number;
  fps: number;
  videoBitrate: string;
  audioBitrate: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
};
