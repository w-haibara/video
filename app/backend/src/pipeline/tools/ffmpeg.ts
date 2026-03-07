import type { FfmpegTool, ProbeResult } from "../types";

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

async function probeJson(inputPath: string): Promise<any> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 100 * attempt));
    }

    const result = await spawn("ffprobe", [
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      "-show_streams",
      inputPath,
    ]);
    assertSuccess(result, "ffprobe");

    try {
      return JSON.parse(result.stdout);
    } catch {
      lastError = new Error(
        `ffprobe JSON parse failed (attempt ${attempt + 1}/${maxRetries}, ` +
        `stdout ${result.stdout.length} bytes): ${result.stdout.slice(0, 200)}`
      );
    }
  }

  throw lastError;
}

export const ffmpegTool: FfmpegTool = {
  async checkInstalled() {
    const [ffmpeg, ffprobe] = await Promise.all([
      spawn("ffmpeg", ["-version"]),
      spawn("ffprobe", ["-version"]),
    ]);
    if (ffmpeg.exitCode !== 0) throw new Error("ffmpeg not found");
    if (ffprobe.exitCode !== 0) throw new Error("ffprobe not found");
  },

  async probe(inputPath) {
    const data = await probeJson(inputPath);
    const videoStream = data.streams?.find(
      (s: { codec_type: string }) => s.codec_type === "video",
    );
    const audioStream = data.streams?.find(
      (s: { codec_type: string }) => s.codec_type === "audio",
    );

    const width = videoStream?.width ?? 0;
    const height = videoStream?.height ?? 0;
    const rotation = videoStream?.tags?.rotate
      ? parseInt(videoStream.tags.rotate, 10)
      : undefined;
    const durationSec =
      videoStream?.duration ?? data.format?.duration;
    const durationMs = durationSec
      ? Math.round(parseFloat(durationSec) * 1000)
      : undefined;
    const codec = videoStream?.codec_name ?? audioStream?.codec_name ?? "unknown";
    const colorSpace = videoStream?.color_space ?? undefined;
    const isHdr =
      videoStream?.color_transfer === "smpte2084" ||
      videoStream?.color_transfer === "arib-std-b67";

    return {
      width,
      height,
      durationMs,
      codec,
      rotation,
      colorSpace,
      hasAudio: !!audioStream,
      isHdr,
    } satisfies ProbeResult;
  },

  async generateThumbnail(inputPath, outputPath) {
    const result = await spawn("ffmpeg", [
      "-y",
      "-i", inputPath,
      "-vframes", "1",
      "-vf", "scale=-2:360",
      "-q:v", "8",
      outputPath,
    ]);
    assertSuccess(result, "generateThumbnail");
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
    const result = await spawn("ffmpeg", [
      "-y",
      "-i", inputPath,
      "-q:v", "2",
      outputPath,
    ]);
    assertSuccess(result, "convertToJpeg");
  },
};
