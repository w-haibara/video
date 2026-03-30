import { useRef, useEffect } from "react";
import type { ActiveClip, PreviewRenderContext, PreviewLayerRenderer } from "../../lib/preview-renderer-registry";
import { findAllActiveClips } from "../../lib/preview-renderer-registry";
import { audioManager } from "../../lib/audio-manager";
import { getAnimatedValue, hasKeyframes } from "@video/shared";
import type { Asset } from "@video/shared";

function getAudioMediaUrl(asset: Asset, projectId: string): string {
  if (asset.kind === "audio" && asset.originalPath) {
    const filename = asset.originalPath.split("/").pop();
    return `/media/projects/${projectId}/originals/${filename}`;
  }
  return "";
}

function getClipVolume(activeClip: ActiveClip): number {
  const clip = activeClip.clip;
  const timeMs = activeClip.clipTimeMs - clip.inMs;
  if (hasKeyframes(clip.keyframeTracks, "volume")) {
    return getAnimatedValue(clip.keyframeTracks, "volume", timeMs, clip.volume ?? 1.0);
  }
  return clip.volume ?? 1.0;
}

/**
 * Invisible audio element that plays audio clips in sync with the timeline.
 * Audio clips have no visual representation but participate in playback.
 */
function AudioElement({
  activeClip,
  projectId,
  isPlaying,
  trackMuted,
}: {
  activeClip: ActiveClip;
  projectId: string;
  isPlaying: boolean;
  trackMuted: boolean;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const lastClipIdRef = useRef<string>("");
  const lastMediaUrlRef = useRef<string>("");
  const sourceChangingRef = useRef(false);
  const sourceVersionRef = useRef(0);

  const mediaUrl = getAudioMediaUrl(activeClip.asset, projectId);
  const volume = getClipVolume(activeClip);

  // Connect audio through AudioManager
  useEffect(() => {
    const audio = ref.current;
    if (!audio || trackMuted) {
      audioManager.disconnectElement(activeClip.clip.id);
      return;
    }
    audioManager.connectElement(activeClip.clip.id, audio, volume);
    return () => {
      audioManager.disconnectElement(activeClip.clip.id);
    };
  }, [activeClip.clip.id, ref.current, trackMuted]);

  // Update volume continuously
  useEffect(() => {
    if (!ref.current || trackMuted) return;
    audioManager.setVolume(activeClip.clip.id, volume);
  }, [activeClip.clip.id, volume, trackMuted]);

  // Handle source changes
  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    const clipChanged = lastClipIdRef.current !== activeClip.clip.id;
    const srcMissing = !audio.src || audio.src === window.location.href;

    if (clipChanged || srcMissing) {
      lastClipIdRef.current = activeClip.clip.id;
      const urlChanged = lastMediaUrlRef.current !== mediaUrl;
      if (urlChanged || srcMissing) {
        lastMediaUrlRef.current = mediaUrl;
        sourceChangingRef.current = true;
        const version = ++sourceVersionRef.current;
        audio.src = mediaUrl;
        const seekTarget = activeClip.clipTimeMs / 1000;
        audio.addEventListener("loadeddata", () => {
          if (sourceVersionRef.current !== version) return;
          sourceChangingRef.current = false;
          audio.currentTime = seekTarget;
          const startPlay = () => {
            if (isPlaying) audio.play().catch(() => {});
          };
          if (audio.seeking) {
            audio.addEventListener("seeked", startPlay, { once: true });
          } else {
            startPlay();
          }
        }, { once: true });
      } else {
        audio.currentTime = activeClip.clipTimeMs / 1000;
        if (isPlaying) audio.play().catch(() => {});
      }
    }
  }, [activeClip.clip.id, mediaUrl, isPlaying]);

  // Play/pause sync
  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Seek when not playing
  useEffect(() => {
    const audio = ref.current;
    if (!audio || isPlaying) return;
    if (sourceChangingRef.current) return;
    audio.currentTime = activeClip.clipTimeMs / 1000;
  }, [activeClip.clipTimeMs, isPlaying]);

  return <audio ref={ref} style={{ display: "none" }} />;
}

function AudioClipComponent({ content, ctx }: { content: unknown; ctx: PreviewRenderContext }) {
  const activeClips = content as ActiveClip[];

  return (
    <>
      {activeClips.map((activeClip) => {
        const trackMuted = ctx.project.sequence.tracks[activeClip.trackIndex]?.muted ?? false;
        return (
          <AudioElement
            key={activeClip.clip.id}
            activeClip={activeClip}
            projectId={ctx.project.id}
            isPlaying={ctx.isPlaying}
            trackMuted={trackMuted}
          />
        );
      })}
    </>
  );
}

function findActiveAudioClips(ctx: PreviewRenderContext): ActiveClip[] | null {
  const clips = findAllActiveClips(ctx.project, ctx.currentTimeMs, "audio", "audio");
  return clips.length > 0 ? clips : null;
}

export const audioClipRenderer: PreviewLayerRenderer = {
  id: "audio-clip",
  zOrder: -1, // Audio has no visual layer, but must still be rendered for playback
  findActiveContent: findActiveAudioClips,
  Component: AudioClipComponent,
};
