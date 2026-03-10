/** Built-in asset kinds for convenience. The Asset.kind field accepts any string. */
export type BuiltinAssetKind = "video" | "image" | "audio";

export type AssetKind = string;

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
