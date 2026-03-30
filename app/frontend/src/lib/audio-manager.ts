/**
 * AudioManager — manages Web Audio API routing for preview playback.
 *
 * Architecture:
 *   HTMLMediaElement -> MediaElementAudioSourceNode -> GainNode (per-clip) -> masterGain -> destination
 *
 * Constraints:
 *   - AudioContext must be created after a user gesture (ensureContext handles this)
 *   - MediaElementAudioSourceNode can only be created once per element, so we track them
 */

export class AudioManager {
  private ctx: AudioContext | null = null;
  private sources = new Map<
    string,
    { source: MediaElementAudioSourceNode; gain: GainNode; element: HTMLMediaElement }
  >();
  /** Track elements that already have a MediaElementAudioSourceNode (can only create once per element). */
  private elementSources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
  private masterGain: GainNode | null = null;
  private muted = false;

  /** Lazily create the AudioContext (must be called from a user gesture context). */
  ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.muted ? 0 : 1;
    }
    // Resume if suspended (browsers suspend until user gesture)
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Connect an HTML media element (video/audio) to the audio graph.
   * The element should NOT have its `muted` attribute set when connected here.
   *
   * If the element was already connected (same clipId), this is a no-op.
   * If a different element is connected under the same clipId, the old one is disconnected first.
   */
  connectElement(
    clipId: string,
    element: HTMLVideoElement | HTMLAudioElement,
    volume = 1.0,
  ): void {
    const ctx = this.ensureContext();
    const existing = this.sources.get(clipId);

    // Already connected with the same element — just update volume
    if (existing && existing.element === element) {
      existing.gain.gain.value = volume;
      return;
    }

    // Different element for same clipId — disconnect old one first
    if (existing) {
      this.disconnectElement(clipId);
    }

    // Reuse existing MediaElementAudioSourceNode if element was previously connected
    const existingSource = this.elementSources.get(element);
    const source = existingSource ?? ctx.createMediaElementSource(element);
    if (!existingSource) {
      this.elementSources.set(element, source);
    }

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.masterGain!);

    this.sources.set(clipId, { source, gain, element });
  }

  /** Disconnect a clip's audio source from the graph. */
  disconnectElement(clipId: string): void {
    const entry = this.sources.get(clipId);
    if (!entry) return;

    try {
      entry.source.disconnect();
    } catch {
      // May already be disconnected
    }
    try {
      entry.gain.disconnect();
    } catch {
      // May already be disconnected
    }
    this.sources.delete(clipId);
  }

  /** Update the volume (gain) for a specific clip. */
  setVolume(clipId: string, volume: number): void {
    const entry = this.sources.get(clipId);
    if (entry) {
      entry.gain.gain.value = volume;
    }
  }

  /** Toggle global mute by setting master gain to 0 or 1. */
  setMasterMute(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  /** Check if a clip is currently connected. */
  isConnected(clipId: string): boolean {
    return this.sources.has(clipId);
  }

  /** Tear down the AudioContext and all connections. */
  dispose(): void {
    for (const [clipId] of this.sources) {
      this.disconnectElement(clipId);
    }
    this.sources.clear();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.masterGain = null;
    }
  }
}

/** Shared singleton instance. */
export const audioManager = new AudioManager();
