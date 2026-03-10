import type { AssetDetector, AssetDetectionContext } from "../asset-detector-registry";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".aac", ".m4a", ".ogg", ".flac"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".heic", ".tiff", ".svg"];

export const extensionDetector: AssetDetector = {
  name: "extension",
  priority: 0,
  detect: (ctx: AssetDetectionContext): string | null => {
    const ext = ctx.extension;
    if (VIDEO_EXTENSIONS.includes(ext)) return "video";
    if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
    if (IMAGE_EXTENSIONS.includes(ext)) return "image";
    return null;
  },
};

// Future detectors can be added with higher priority:
//
// magic-byte-detector (priority: 20)
//   Reads the first few bytes of the file to determine the true format,
//   useful for files with incorrect or missing extensions.
//
// mime-type-detector (priority: 10)
//   Uses the MIME type from the upload request to determine the format,
//   falling back to extension-based detection.
