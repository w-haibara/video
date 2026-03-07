export type AssetKind = "video" | "image" | "audio";

export type Asset = {
  id: string;
  kind: AssetKind;
  originalPath: string;
  proxyPath?: string;
  thumbnailPath?: string;
  width?: number;
  height?: number;
  durationMs?: number;
  rotation?: number;
  codec?: string;
  colorSpace?: string;
  hasAudio?: boolean;
};
