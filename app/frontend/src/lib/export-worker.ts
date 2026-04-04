/**
 * Web Worker that receives rendered ImageBitmap frames from the main thread
 * and encodes them into an MP4 file using mediabunny.
 *
 * Protocol:
 *   Main -> Worker:
 *     { type: "init", data: { width, height, fps, videoBitrate, audioCodec?, audioBitrate? } }
 *     { type: "frame", data: { bitmap: ImageBitmap, timestamp: number, duration: number, progress: number } }
 *       (bitmap is transferred, not copied)
 *     { type: "audio", data: { channelData: Float32Array[], sampleRate: number, length: number, numberOfChannels: number } }
 *       (channelData buffers are transferred)
 *     { type: "flush" }
 *
 *   Worker -> Main:
 *     { type: "ready" }
 *     { type: "progress", value: number }
 *     { type: "done", blob: Blob }
 *     { type: "error", message: string }
 */

import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  VideoSampleSource,
  VideoSample,
  AudioBufferSource,
  canEncodeVideo,
  type VideoEncodingConfig,
  type AudioEncodingConfig,
} from "mediabunny";

let videoSource: VideoSampleSource | null = null;
let audioSource: AudioBufferSource | null = null;
let output: Output | null = null;
let target: BufferTarget | null = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, data } = e.data;

  try {
    if (type === "init") {
      const { width, height, fps: _fps, videoBitrate, audioCodec, audioBitrate } = data as {
        width: number;
        height: number;
        fps: number;
        videoBitrate: number;
        audioCodec?: "aac" | "opus" | null;
        audioBitrate?: number;
      };

      // Determine video codec — try AVC first, fall back
      let videoCodecChoice: "avc" | "vp9" | "vp8" = "avc";
      const canAvc = await canEncodeVideo("avc", {
        width,
        height,
        bitrate: videoBitrate,
      });
      if (!canAvc) {
        const canVp9 = await canEncodeVideo("vp9", {
          width,
          height,
          bitrate: videoBitrate,
        });
        videoCodecChoice = canVp9 ? "vp9" : "vp8";
      }

      const encodingConfig: VideoEncodingConfig = {
        codec: videoCodecChoice,
        bitrate: videoBitrate,
        keyFrameInterval: 2,
        hardwareAcceleration: "no-preference",
      };

      videoSource = new VideoSampleSource(encodingConfig);

      // Set up audio source if audio codec was provided
      if (audioCodec) {
        const audioConfig: AudioEncodingConfig = {
          codec: audioCodec,
          bitrate: audioBitrate ?? 192_000,
        };
        audioSource = new AudioBufferSource(audioConfig);
      }

      target = new BufferTarget();
      output = new Output({
        format: new Mp4OutputFormat({ fastStart: "in-memory" }),
        target,
      });

      output.addVideoTrack(videoSource);
      if (audioSource) {
        output.addAudioTrack(audioSource);
      }
      await output.start();

      self.postMessage({ type: "ready" });
    }

    if (type === "frame") {
      if (!videoSource) {
        throw new Error("Worker not initialized");
      }

      const { bitmap, timestamp, duration, progress, keyFrame } = data as {
        bitmap: ImageBitmap;
        timestamp: number;
        duration: number;
        progress: number;
        keyFrame: boolean;
      };

      // Create a VideoSample from the ImageBitmap
      const sample = new VideoSample(bitmap as unknown as CanvasImageSource, {
        timestamp,
        duration,
      });

      await videoSource.add(sample, { keyFrame });

      sample.close();
      bitmap.close();

      self.postMessage({ type: "progress", value: progress });
    }

    if (type === "audio") {
      if (!audioSource) {
        throw new Error("Audio source not initialized");
      }

      const { channelData, sampleRate, length, numberOfChannels } = data as {
        channelData: Float32Array[];
        sampleRate: number;
        length: number;
        numberOfChannels: number;
      };

      // Reconstruct AudioBuffer from transferred Float32Array channels
      const audioBuffer = new AudioBuffer({
        length,
        numberOfChannels,
        sampleRate,
      });
      for (let ch = 0; ch < numberOfChannels; ch++) {
        audioBuffer.copyToChannel(channelData[ch], ch);
      }

      await audioSource.add(audioBuffer);
      audioSource.close();
    }

    if (type === "flush") {
      if (!output || !target) {
        throw new Error("Worker not initialized");
      }

      await output.finalize();

      const buffer = target.buffer;
      if (!buffer) {
        throw new Error("Export failed: no output buffer produced");
      }

      const blob = new Blob([buffer], { type: "video/mp4" });
      self.postMessage({ type: "done", blob });

      // Clean up
      videoSource = null;
      audioSource = null;
      output = null;
      target = null;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "error", message });
  }
};
