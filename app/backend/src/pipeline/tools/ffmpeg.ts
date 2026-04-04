import type { FfmpegTool, ProbeResult } from "../types";
import {
  Input,
  FilePathSource,
  MP4,
  QTFF,
  MATROSKA,
  WEBM,
  MP3,
  WAVE,
  OGG,
  FLAC,
  ADTS,
  MPEG_TS,
} from "mediabunny";
import sharp from "sharp";
import { extname } from "node:path";

const MEDIA_FORMATS = [MP4, QTFF, MATROSKA, WEBM, MP3, WAVE, OGG, FLAC, ADTS, MPEG_TS];

async function spawn(
  cmd: string,
  args: string[],
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn([cmd, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  // Read streams by collecting chunks manually to avoid truncation issues
  async function readStream(stream: ReadableStream<Uint8Array> | null): Promise<string> {
    if (!stream) return "";
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return new TextDecoder().decode(Buffer.concat(chunks));
  }

  const [stdout, stderr] = await Promise.all([
    readStream(proc.stdout),
    readStream(proc.stderr),
  ]);
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}

function assertSuccess(
  result: { exitCode: number; stderr: string },
  context: string,
): void {
  if (result.exitCode !== 0) {
    throw new Error(`${context} failed (exit ${result.exitCode}): ${result.stderr}`);
  }
}

/**
 * Probe a media file using mediabunny (handles video/audio container formats).
 */
async function probeWithMediabunny(inputPath: string): Promise<ProbeResult> {
  const source = new FilePathSource(inputPath);
  const input = new Input({ formats: MEDIA_FORMATS, source });

  try {
    const videoTrack = await input.getPrimaryVideoTrack();
    const audioTrack = await input.getPrimaryAudioTrack();

    let width = 0;
    let height = 0;
    let rotation: number | undefined;
    let codec = "unknown";
    let colorSpace: string | undefined;
    let isHdr = false;

    if (videoTrack) {
      width = videoTrack.codedWidth;
      height = videoTrack.codedHeight;
      rotation = videoTrack.rotation || undefined;
      codec = videoTrack.codec ?? "unknown";

      const cs = await videoTrack.getColorSpace();
      if (cs.matrix) colorSpace = cs.matrix;
      isHdr = await videoTrack.hasHighDynamicRange();
    } else if (audioTrack) {
      codec = audioTrack.codec ?? "unknown";
    }

    const durationSec = await input.computeDuration();
    const durationMs = durationSec > 0 ? Math.round(durationSec * 1000) : undefined;

    return {
      width,
      height,
      durationMs,
      codec,
      rotation,
      colorSpace,
      hasAudio: !!audioTrack,
      isHdr,
    };
  } finally {
    input.dispose();
  }
}

/**
 * Probe an image file by reading its header bytes to extract dimensions.
 * Supports JPEG, PNG, GIF, BMP, and WebP.
 */
async function probeImageFile(inputPath: string): Promise<ProbeResult> {
  const file = Bun.file(inputPath);
  // Read first 32 bytes for header inspection
  const headerBuf = await file.slice(0, 32).arrayBuffer();
  const header = new Uint8Array(headerBuf);

  let width = 0;
  let height = 0;
  let codec = "unknown";

  // PNG: 8-byte signature, then IHDR chunk at offset 16 (width) and 20 (height)
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
    codec = "png";
    const view = new DataView(headerBuf);
    width = view.getUint32(16);
    height = view.getUint32(20);
  }
  // GIF: "GIF8" signature, width/height at offset 6/8 (little-endian 16-bit)
  else if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
    codec = "gif";
    const view = new DataView(headerBuf);
    width = view.getUint16(6, true);
    height = view.getUint16(8, true);
  }
  // BMP: "BM" signature, width/height at offset 18/22 (little-endian 32-bit)
  else if (header[0] === 0x42 && header[1] === 0x4D) {
    codec = "bmp";
    const view = new DataView(headerBuf);
    width = view.getInt32(18, true);
    height = Math.abs(view.getInt32(22, true));
  }
  // WebP: "RIFF....WEBP" + VP8 chunk
  else if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
           header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) {
    codec = "webp";
    // VP8 lossy: chunk at offset 12 = "VP8 ", dimensions at offset 26/28
    if (header[12] === 0x56 && header[13] === 0x50 && header[14] === 0x38 && header[15] === 0x20) {
      const view = new DataView(headerBuf);
      width = view.getUint16(26, true) & 0x3FFF;
      height = view.getUint16(28, true) & 0x3FFF;
    }
  }
  // JPEG: Read SOF marker for dimensions (needs more bytes)
  else if (header[0] === 0xFF && header[1] === 0xD8) {
    codec = "jpeg";
    // Read up to 64KB for JPEG SOF marker search
    const jpegBuf = await file.slice(0, 65536).arrayBuffer();
    const jpegBytes = new Uint8Array(jpegBuf);
    const jpegView = new DataView(jpegBuf);
    let offset = 2;
    while (offset < jpegBytes.length - 8) {
      if (jpegBytes[offset] !== 0xFF) break;
      const marker = jpegBytes[offset + 1];
      // SOF markers: 0xC0-0xCF except 0xC4 (DHT) and 0xCC (DAC)
      if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xCC) {
        height = jpegView.getUint16(offset + 5);
        width = jpegView.getUint16(offset + 7);
        break;
      }
      const segLen = jpegView.getUint16(offset + 2);
      offset += 2 + segLen;
    }
  }

  return {
    width,
    height,
    codec,
  };
}

export const ffmpegTool: FfmpegTool = {
  async probe(inputPath) {
    // Try mediabunny first (handles video/audio container formats)
    try {
      return await probeWithMediabunny(inputPath);
    } catch {
      // Fallback for image files — mediabunny doesn't support image formats
      return probeImageFile(inputPath);
    }
  },

  async generateThumbnail(inputPath, outputPath) {
    const ext = extname(inputPath).toLowerCase();
    const imageExts = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".tif", ".heic", ".heif", ".avif"]);

    if (imageExts.has(ext)) {
      // Use sharp for image thumbnails (no FFmpeg needed)
      await sharp(inputPath)
        .resize({ height: 360, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
    } else {
      // For video files, still use FFmpeg to extract first frame
      const result = await spawn("ffmpeg", [
        "-y",
        "-i", inputPath,
        "-vframes", "1",
        "-vf", "scale=-2:360",
        "-q:v", "8",
        outputPath,
      ]);
      assertSuccess(result, "generateThumbnail");
    }
  },

  async generateProxy(inputPath, outputPath, opts, onProgress) {
    const filters = opts.isHdr
      ? "scale=-2:720,zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709:t=bt709:m=bt709:r=tv,format=yuv420p"
      : "scale=-2:720";

    const args = [
      "-y",
      "-i", inputPath,
      "-vf", filters,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-r", "30",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "-progress", "pipe:1",
      "-nostats",
      outputPath,
    ];

    const proc = Bun.spawn(["ffmpeg", ...args], {
      stdout: "pipe",
      stderr: "pipe",
    });

    if (onProgress && proc.stdout) {
      const reader = proc.stdout.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      // Parse progress from ffmpeg's -progress pipe:1 output
      // We need duration to compute fraction; read it first from stderr after process ends
      // For now, just forward raw progress events
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          // ffmpeg progress output contains "out_time_us=..." lines
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const match = line.match(/^out_time_us=(\d+)/);
            if (match) {
              // We don't have total duration here; caller can compute fraction
              // For simplicity, emit raw microseconds and let step handle it
              const us = parseInt(match[1], 10);
              // Store for the step to compute fraction
              onProgress(us);
            }
          }
        }
      } catch {
        // reader may error if process exits; ignore
      }
    }

    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      const stderr = proc.stderr
        ? await new Response(proc.stderr).text()
        : "";
      throw new Error(
        `generateProxy failed (exit ${exitCode}): ${stderr}`,
      );
    }
  },

  async convertToJpeg(inputPath, outputPath) {
    // Use sharp for JPEG conversion (supports HEIC, HEIF, AVIF, WebP, etc.)
    await sharp(inputPath)
      .jpeg({ quality: 90 })
      .toFile(outputPath);
  },
};
