/**
 * Offline audio mixer using Web Audio API's OfflineAudioContext.
 *
 * Collects audio clips (clipKind === "audio") and video clips with embedded
 * audio (asset.hasAudio === true) from non-muted tracks, fetches and decodes
 * each audio file, mixes them down via gain-scheduled AudioBufferSourceNodes,
 * and returns a single mixed AudioBuffer ready for mediabunny encoding.
 */

import type { Project, Asset, Clip, KeyframeTrack } from "@video/shared";

// ── Public types ──

export type AudioMixOptions = {
  project: Project;
  /** Resolve an asset ID to a fetchable audio URL, or null to skip. */
  getAudioUrl: (assetId: string) => string | null;
  /** Sample rate for the mixed output (default 48000). */
  sampleRate?: number;
  /** Progress callback (0..1). */
  onProgress?: (progress: number) => void;
};

export type AudioMixResult = {
  audioBuffer: AudioBuffer;
  sampleRate: number;
  durationMs: number;
};

// ── Internals ──

type AudioClipInfo = {
  clip: Clip;
  asset: Asset;
  url: string;
};

/**
 * Collect all clips that contribute audio from non-muted tracks.
 */
function collectAudioClips(project: Project, getAudioUrl: (assetId: string) => string | null): AudioClipInfo[] {
  const result: AudioClipInfo[] = [];

  for (const track of project.sequence.tracks) {
    if (track.muted) continue;

    for (const clip of track.clips) {
      const asset = project.assets.find((a) => a.id === clip.assetId);
      if (!asset) continue;

      const isAudioClip = clip.clipKind === "audio";
      const isVideoWithAudio = clip.clipKind === "video" && asset.hasAudio === true;

      if (!isAudioClip && !isVideoWithAudio) continue;

      const url = getAudioUrl(asset.id);
      if (!url) continue;

      result.push({ clip, asset, url });
    }
  }

  return result;
}

/**
 * Compute the overall timeline end from all clips (audio-contributing or not).
 */
function getSequenceEndMs(project: Project): number {
  let endMs = 0;
  for (const track of project.sequence.tracks) {
    for (const clip of track.clips) {
      const clipEnd = clip.startMs + clip.durationMs;
      if (clipEnd > endMs) endMs = clipEnd;
    }
  }
  return endMs;
}

/**
 * Evaluate volume keyframes for a clip and schedule gain automation.
 *
 * Samples keyframe values at 100 ms intervals and schedules
 * linearRampToValueAtTime for smooth interpolation.
 */
function scheduleVolumeKeyframes(
  gainNode: GainNode,
  clip: Clip,
  baseVolume: number,
): void {
  const volumeTrack = clip.keyframeTracks?.find(
    (t: KeyframeTrack) => t.property === "volume",
  );
  if (!volumeTrack || volumeTrack.keyframes.length === 0) return;

  const clipStartSec = clip.startMs / 1000;
  const clipDurationMs = clip.durationMs;

  // Sample at 100 ms intervals
  const stepMs = 100;
  for (let offsetMs = 0; offsetMs <= clipDurationMs; offsetMs += stepMs) {
    const kfValue = evaluateKeyframeValue(volumeTrack, offsetMs);
    if (kfValue !== undefined) {
      const timeSec = clipStartSec + offsetMs / 1000;
      const volume = kfValue * baseVolume;
      if (offsetMs === 0) {
        gainNode.gain.setValueAtTime(volume, timeSec);
      } else {
        gainNode.gain.linearRampToValueAtTime(volume, timeSec);
      }
    }
  }
}

/**
 * Simple linear keyframe evaluator (handles linear easing only for
 * gain scheduling — good enough for OfflineAudioContext).
 */
function evaluateKeyframeValue(
  track: KeyframeTrack,
  timeMs: number,
): number | undefined {
  const kfs = track.keyframes;
  if (kfs.length === 0) return undefined;

  // Before first keyframe
  if (timeMs <= kfs[0].timeMs) return kfs[0].value;

  // After last keyframe
  if (timeMs >= kfs[kfs.length - 1].timeMs) return kfs[kfs.length - 1].value;

  // Find surrounding keyframes
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i];
    const b = kfs[i + 1];
    if (timeMs >= a.timeMs && timeMs <= b.timeMs) {
      const t = (timeMs - a.timeMs) / (b.timeMs - a.timeMs);
      return a.value + (b.value - a.value) * t;
    }
  }

  return undefined;
}

// ── Main entry ──

/**
 * Mix all audio clips in the project into a single AudioBuffer using
 * OfflineAudioContext. Returns null if there are no audio clips.
 */
export async function mixAudio(
  options: AudioMixOptions,
): Promise<AudioMixResult | null> {
  const { project, getAudioUrl, onProgress } = options;
  const sampleRate = options.sampleRate ?? 48_000;
  const numberOfChannels = 2; // stereo

  const audioClips = collectAudioClips(project, getAudioUrl);
  if (audioClips.length === 0) return null;

  const durationMs = getSequenceEndMs(project);
  if (durationMs <= 0) return null;

  const durationSec = durationMs / 1000;
  const totalSamples = Math.ceil(durationSec * sampleRate);

  const offlineCtx = new OfflineAudioContext(
    numberOfChannels,
    totalSamples,
    sampleRate,
  );

  // Fetch and decode all audio files in parallel
  const decoded: { info: AudioClipInfo; buffer: AudioBuffer }[] = [];
  const fetchPromises = audioClips.map(async (info, index) => {
    try {
      const response = await fetch(info.url);
      if (!response.ok) {
        console.warn(
          `[audio-mixer] Failed to fetch audio for asset ${info.asset.id}: ${response.status}`,
        );
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
      decoded.push({ info, buffer: audioBuffer });
    } catch (err) {
      console.warn(
        `[audio-mixer] Failed to decode audio for asset ${info.asset.id}:`,
        err,
      );
    }
    if (onProgress) {
      onProgress(((index + 1) / audioClips.length) * 0.5); // first 50% = fetch/decode
    }
  });

  await Promise.all(fetchPromises);

  if (decoded.length === 0) return null;

  // Schedule each decoded clip
  for (const { info, buffer } of decoded) {
    const { clip } = info;
    const speed = clip.speed ?? 1;
    const baseVolume = clip.volume ?? 1;

    const sourceNode = offlineCtx.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.playbackRate.value = speed;

    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = baseVolume;

    // Schedule volume keyframes if present
    scheduleVolumeKeyframes(gainNode, clip, baseVolume);

    sourceNode.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    const startTimeSec = clip.startMs / 1000;
    const offsetSec = clip.inMs / 1000;
    const playDurationSec = (clip.outMs - clip.inMs) / 1000 / speed;

    sourceNode.start(startTimeSec, offsetSec, playDurationSec);
  }

  // Render
  if (onProgress) onProgress(0.6);

  const renderedBuffer = await offlineCtx.startRendering();

  if (onProgress) onProgress(1);

  return {
    audioBuffer: renderedBuffer,
    sampleRate,
    durationMs,
  };
}
