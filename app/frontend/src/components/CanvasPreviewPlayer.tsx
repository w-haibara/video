import { useRef, useEffect, useCallback, useState } from "react";
import type { Project, Clip, Asset } from "@video/shared";
import { theme, buttonStyle } from "../theme";
import { CanvasCompositor, type FrameSources } from "../lib/canvas-compositor";
import {
  findAllActiveClips,
  findAllActiveEmptyClips,
  previewRendererRegistry,
  type ActiveClip,
  type PreviewRenderContext,
} from "../lib/preview-renderer-registry";
import { audioManager } from "../lib/audio-manager";

type Props = {
  project: Project;
  currentTimeMs: number;
  onTimeUpdate: (ms: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  selectedClipId?: string | null;
  onSelectClip: (id: string | null) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isPopout?: boolean;
  onTogglePopout?: () => void;
};

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

function findClipById(project: Project, clipId: string): Clip | null {
  for (const track of project.sequence.tracks) {
    for (const clip of track.clips) {
      if (clip.id === clipId) return clip;
    }
  }
  return null;
}

function getMediaUrl(asset: Asset, projectId: string): string {
  if ((asset.kind === "video" || asset.kind === "p5js") && asset.proxyPath) {
    if (asset.proxyPath.startsWith("render-cache/")) {
      return `/media/projects/${projectId}/${asset.proxyPath}`;
    }
    const filename = asset.proxyPath.split("/").pop();
    return `/media/projects/${projectId}/proxies/${filename}`;
  }
  if (asset.kind === "image" && asset.thumbnailPath) {
    const filename = asset.thumbnailPath.split("/").pop();
    return `/media/projects/${projectId}/thumbnails/${filename}`;
  }
  if (asset.thumbnailPath) {
    const filename = asset.thumbnailPath.split("/").pop();
    return `/media/projects/${projectId}/thumbnails/${filename}`;
  }
  return "";
}

function getImageUrl(asset: Asset, projectId: string): string {
  // Prefer original for images to get full resolution
  if (asset.originalPath) {
    const filename = asset.originalPath.split("/").pop();
    return `/media/projects/${projectId}/originals/${filename}`;
  }
  if (asset.thumbnailPath) {
    const filename = asset.thumbnailPath.split("/").pop();
    return `/media/projects/${projectId}/thumbnails/${filename}`;
  }
  return "";
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const frac = Math.floor((ms % 1000) / 100);
  return `${min}:${sec.toString().padStart(2, "0")}.${frac}`;
}

export function CanvasPreviewPlayer({
  project,
  currentTimeMs,
  onTimeUpdate,
  isPlaying,
  onPlayPause,
  selectedClipId,
  onSelectClip,
  isFullscreen,
  onToggleFullscreen,
  isPopout,
  onTogglePopout,
}: Props) {
  const [isMuted, setIsMuted] = useState(audioManager.isMuted());
  const toggleMute = useCallback(() => {
    audioManager.ensureContext();
    const next = !isMuted;
    audioManager.setMasterMute(next);
    setIsMuted(next);
  }, [isMuted]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compositorRef = useRef<CanvasCompositor | null>(null);
  const animFrameRef = useRef<number>(0);

  // Video element management: one hidden <video> per video/p5js asset
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Image element management: one hidden <img> per image asset
  const imageElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Track which video clips are active and their source versions
  const videoSourceVersionsRef = useRef<Map<string, number>>(new Map());
  const videoSourceChangingRef = useRef<Set<string>>(new Set());
  const videoEndedRef = useRef<Set<string>>(new Set());

  // Refs to avoid stale closures in tick loop
  const currentTimeMsRef = useRef(currentTimeMs);
  currentTimeMsRef.current = currentTimeMs;
  const projectRef = useRef(project);
  projectRef.current = project;
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const onPlayPauseRef = useRef(onPlayPause);
  onPlayPauseRef.current = onPlayPause;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const selectedClipIdRef = useRef(selectedClipId);
  selectedClipIdRef.current = selectedClipId;

  const canvasW = project.settings.canvasWidth;
  const canvasH = project.settings.canvasHeight;

  // Initialize compositor when canvas is available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    compositorRef.current = new CanvasCompositor(canvas);
    return () => {
      compositorRef.current?.dispose();
      compositorRef.current = null;
    };
  }, []);

  // --- Video element management ---

  // Get or create a hidden video element for a given asset
  const getOrCreateVideoElement = useCallback((assetId: string, mediaUrl: string): HTMLVideoElement => {
    const existing = videoElementsRef.current.get(assetId);
    if (existing) return existing;

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    video.preload = "auto";
    video.muted = true; // Muted for canvas drawing; audio is handled by AudioManager
    video.style.display = "none";
    video.src = mediaUrl;

    video.addEventListener("ended", () => {
      videoEndedRef.current.add(assetId);
    });

    // Append to container so it stays in the DOM
    videoContainerRef.current?.appendChild(video);
    videoElementsRef.current.set(assetId, video);
    return video;
  }, []);

  // Get or create a hidden image element for a given asset
  const getOrCreateImageElement = useCallback((assetId: string, imageUrl: string): HTMLImageElement => {
    const existing = imageElementsRef.current.get(assetId);
    if (existing) return existing;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    imageElementsRef.current.set(assetId, img);
    return img;
  }, []);

  // Sync video elements with active clips
  useEffect(() => {
    const proj = project;
    const allActiveClips = findAllActiveClips(proj, currentTimeMs);

    for (const ac of allActiveClips) {
      const asset = ac.asset;
      if (asset.kind === "video" || asset.kind === "p5js") {
        const url = getMediaUrl(asset, proj.id);
        if (!url) continue;
        const video = getOrCreateVideoElement(asset.id, url);

        // Check if source needs updating
        if (video.src && !video.src.endsWith(url.split("/").pop() ?? "")) {
          const version = (videoSourceVersionsRef.current.get(asset.id) ?? 0) + 1;
          videoSourceVersionsRef.current.set(asset.id, version);
          videoSourceChangingRef.current.add(asset.id);
          video.src = url;
          const seekTarget = ac.clipTimeMs / 1000;
          video.addEventListener("loadeddata", () => {
            if (videoSourceVersionsRef.current.get(asset.id) !== version) return;
            videoSourceChangingRef.current.delete(asset.id);
            video.currentTime = seekTarget;
            if (isPlayingRef.current) {
              video.play().catch(() => {});
            }
          }, { once: true });
        }

        // Connect audio for video clips
        const trackMuted = proj.sequence.tracks[ac.trackIndex]?.muted ?? false;
        if (!trackMuted) {
          audioManager.connectElement(ac.clip.id, video, ac.clip.volume ?? 1.0);
        } else {
          audioManager.disconnectElement(ac.clip.id);
        }
      } else if (asset.kind === "image") {
        const url = getImageUrl(asset, proj.id);
        if (url) {
          getOrCreateImageElement(asset.id, url);
        }
      }
    }
  }, [project, currentTimeMs, getOrCreateVideoElement, getOrCreateImageElement]);

  // Build FrameSources map from loaded media elements
  const buildSources = useCallback((): FrameSources => {
    const sources: FrameSources = new Map();
    for (const [assetId, video] of videoElementsRef.current) {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        sources.set(assetId, video);
      }
    }
    for (const [assetId, img] of imageElementsRef.current) {
      if (img.complete && img.naturalWidth > 0) {
        sources.set(assetId, img);
      }
    }
    return sources;
  }, []);

  // Render current frame
  const renderCurrentFrame = useCallback(() => {
    const compositor = compositorRef.current;
    if (!compositor) return;
    const proj = projectRef.current;
    const timeMs = currentTimeMsRef.current;
    const sources = buildSources();
    compositor.renderFrame(proj, timeMs, sources);
  }, [buildSources]);

  // Seek all video elements when scrubbing (not playing)
  useEffect(() => {
    if (isPlaying) return;
    let cancelled = false;

    const seekAndRender = async () => {
      // Clear ended state so that subsequent play works after seek/rewind
      videoEndedRef.current.clear();

      const allActiveClips = findAllActiveClips(project, currentTimeMs);
      const seekPromises: Promise<void>[] = [];

      for (const ac of allActiveClips) {
        const asset = ac.asset;
        if (asset.kind !== "video" && asset.kind !== "p5js") continue;
        const video = videoElementsRef.current.get(asset.id);
        if (!video) continue;
        if (videoSourceChangingRef.current.has(asset.id)) continue;

        const targetSec = ac.clipTimeMs / 1000;
        if (video.ended) {
          // After ended, video.load() is needed to fully reset the element so
          // drawImage returns valid frame data. Handle entirely outside the
          // async promise chain to avoid React re-render cancellation issues.
          const render = renderCurrentFrame;
          video.load();
          video.addEventListener("loadeddata", () => {
            video.currentTime = targetSec;
            video.addEventListener("seeked", () => {
              render();
              requestAnimationFrame(() => render());
            }, { once: true });
          }, { once: true });
          continue; // Skip seekPromises for this video
        }
        if (video.readyState < 2) {
          // Video not yet loaded — wait for loadeddata first
          seekPromises.push(
            new Promise<void>((resolve) => {
              const onReady = () => {
                video.currentTime = targetSec;
                video.addEventListener("seeked", () => resolve(), { once: true });
              };
              video.addEventListener("loadeddata", onReady, { once: true });
            }),
          );
        } else if (Math.abs(video.currentTime - targetSec) > 0.01) {
          video.currentTime = targetSec;
          seekPromises.push(
            new Promise<void>((resolve) => {
              video.addEventListener("seeked", () => resolve(), { once: true });
            }),
          );
        }
      }

      if (seekPromises.length > 0) {
        await Promise.all(seekPromises);
      }
      // Always render after seek completes — even if the effect was "cancelled" by a
      // React re-render (e.g. triggered by video state changes during seek). The render
      // is safe and idempotent; skipping it causes blank frames after rewind.
      renderCurrentFrame();
      // Extra rAF for the browser to paint the decoded frame
      requestAnimationFrame(() => renderCurrentFrame());
    };

    seekAndRender();
    return () => { cancelled = true; };
  }, [currentTimeMs, isPlaying, project, renderCurrentFrame]);

  // Play/pause video elements
  useEffect(() => {
    if (isPlaying) {
      // Clear ended tracking — we are starting fresh playback
      videoEndedRef.current.clear();
    }

    const proj = projectRef.current;
    const curTime = currentTimeMsRef.current;

    for (const [assetId, video] of videoElementsRef.current) {
      if (isPlaying) {
        const allActive = findAllActiveClips(proj, curTime);
        const ac = allActive.find((c) => c.asset.id === assetId);
        const targetSec = ac ? ac.clipTimeMs / 1000 : 0;
        // Seek to correct position before playing (handles ended state)
        video.currentTime = targetSec;
        video.addEventListener("seeked", () => {
          video.play().catch(() => {});
        }, { once: true });
      } else {
        video.pause();
      }
    }
  }, [isPlaying]);

  // Playback tick loop — same strategy as existing PreviewPlayer
  useEffect(() => {
    if (!isPlaying) return;

    const mediaRenderers = previewRendererRegistry.all().filter((r) => r.zOrder === 0);
    // Dummy video ref for tick strategy (we manage video elements differently)
    const dummyVideoRef = { current: null as HTMLVideoElement | null };
    let lastFrameTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const deltaMs = now - lastFrameTime;
      lastFrameTime = now;

      const curTime = currentTimeMsRef.current;
      const proj = projectRef.current;
      const seqEnd = getSequenceEndMs(proj);

      // Determine playback end point
      const selId = selectedClipIdRef.current;
      const selClip = selId ? findClipById(proj, selId) : null;
      const playEnd = selClip ? selClip.startMs + selClip.durationMs : seqEnd;

      if (playEnd <= 0 || curTime >= playEnd) {
        onPlayPauseRef.current();
        return;
      }

      // Find active media clip through renderers
      const tickRenderCtx: PreviewRenderContext = {
        project: proj,
        currentTimeMs: curTime,
        canvasW,
        canvasH,
        canvasScale: 1,
        isPlaying: true,
        videoRef: dummyVideoRef as React.RefObject<HTMLVideoElement | null>,
      };

      let activeMedia: ActiveClip | null = null;
      for (const r of mediaRenderers) {
        const c = r.findActiveContent(tickRenderCtx);
        if (c) {
          const clips = c as ActiveClip[];
          activeMedia = clips[clips.length - 1];
          break;
        }
      }

      let newTime: number | null = null;

      if (activeMedia) {
        const assetId = activeMedia.asset.id;
        const video = videoElementsRef.current.get(assetId);
        // Set dummy video ref for tick strategy
        dummyVideoRef.current = video ?? null;

        const clipEndMs = activeMedia.clip.startMs + activeMedia.clip.durationMs;
        const strategy = previewRendererRegistry.getTickStrategy(activeMedia.asset.kind);

        if (strategy) {
          const tickCtx = {
            currentTimeMs: curTime,
            videoRef: video ?? null,
            lastClipId: activeMedia.clip.id,
            videoEnded: videoEndedRef.current.has(assetId),
            resetVideoEnded: () => { videoEndedRef.current.delete(assetId); },
            sourceChanging: videoSourceChangingRef.current.has(assetId),
          };
          newTime = strategy.tick(activeMedia, deltaMs, tickCtx);
        } else {
          newTime = Math.min(curTime + deltaMs, clipEndMs);
        }
      } else {
        newTime = curTime + deltaMs;
      }

      // Fallback: advance by wall-clock
      if (newTime === null && activeMedia) {
        const clipEndMs = activeMedia.clip.startMs + activeMedia.clip.durationMs;
        newTime = Math.min(curTime + deltaMs, clipEndMs);
      }

      if (newTime !== null) {
        if (newTime >= playEnd) {
          currentTimeMsRef.current = playEnd;
          onTimeUpdateRef.current(playEnd);
          onPlayPauseRef.current();
          return;
        }
        currentTimeMsRef.current = newTime;
        onTimeUpdateRef.current(newTime);
      }

      // Render the frame
      renderCurrentFrame();

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, canvasW, canvasH, renderCurrentFrame]);

  // Audio layer rendering — find active audio clips and manage hidden audio elements
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    const proj = project;
    const activeAudioClips = findAllActiveClips(proj, currentTimeMs, "audio", "audio");

    // Create/update audio elements for active audio clips
    for (const ac of activeAudioClips) {
      const asset = ac.asset;
      if (asset.kind !== "audio" || !asset.originalPath) continue;
      const filename = asset.originalPath.split("/").pop();
      const url = `/media/projects/${proj.id}/originals/${filename}`;

      let audio = audioElementsRef.current.get(ac.clip.id);
      if (!audio) {
        audio = document.createElement("audio");
        audio.preload = "auto";
        audio.src = url;
        videoContainerRef.current?.appendChild(audio);
        audioElementsRef.current.set(ac.clip.id, audio);
      }

      const trackMuted = proj.sequence.tracks[ac.trackIndex]?.muted ?? false;
      if (!trackMuted) {
        audioManager.connectElement(ac.clip.id, audio, ac.clip.volume ?? 1.0);
      } else {
        audioManager.disconnectElement(ac.clip.id);
      }

      // Seek/play
      if (isPlaying) {
        if (audio.paused) {
          audio.currentTime = ac.clipTimeMs / 1000;
          audio.play().catch(() => {});
        }
      } else {
        audio.pause();
        audio.currentTime = ac.clipTimeMs / 1000;
      }
    }

    // Pause audio elements that are no longer active
    const activeAudioClipIds = new Set(activeAudioClips.map((ac) => ac.clip.id));
    for (const [clipId, audio] of audioElementsRef.current) {
      if (!activeAudioClipIds.has(clipId)) {
        audio.pause();
        audioManager.disconnectElement(clipId);
      }
    }
  }, [project, currentTimeMs, isPlaying]);

  // Escape key exits fullscreen
  useEffect(() => {
    if (!isFullscreen || !onToggleFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onToggleFullscreen();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onToggleFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    const videoElements = videoElementsRef.current;
    const audioElements = audioElementsRef.current;
    return () => {
      // Clean up video elements
      for (const [, video] of videoElements) {
        video.pause();
        video.src = "";
        video.remove();
      }
      videoElements.clear();
      // Clean up audio elements
      for (const [clipId, audio] of audioElements) {
        audio.pause();
        audio.src = "";
        audio.remove();
        audioManager.disconnectElement(clipId);
      }
      audioElements.clear();
    };
  }, []);

  // Check if there is any visual content at current time
  // Include media clips, empty clips (placeholders), and text clips
  const activeMediaClips = findAllActiveClips(project, currentTimeMs);
  const activeEmptyClips = findAllActiveEmptyClips(project, currentTimeMs);
  const hasTextClips = project.sequence.tracks.some(t => !t.muted && t.clips.some(c =>
    c.clipKind === "title" && c.text && currentTimeMs >= c.startMs && currentTimeMs < c.startMs + c.durationMs
  ));
  const hasMediaContent = activeMediaClips.length > 0 || activeEmptyClips.length > 0 || hasTextClips;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: theme.bgDark,
        ...(isFullscreen ? {
          position: "fixed" as const,
          inset: 0,
          zIndex: 1000,
        } : {}),
      }}
    >
      {/* Preview area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          background: theme.bgDark,
        }}
      >
        {!hasMediaContent ? (
          <span style={{ color: theme.textMuted, fontSize: "14px" }}>No clip at playhead</span>
        ) : (
          <canvas
            ref={canvasRef}
            data-testid="preview-canvas"
            width={canvasW}
            height={canvasH}
            style={{
              aspectRatio: `${canvasW} / ${canvasH}`,
              maxWidth: "100%",
              maxHeight: "100%",
              background: theme.black,
            }}
          />
        )}
        {/* Hidden container for video/audio elements */}
        <div ref={videoContainerRef} style={{ display: "none" }} />
      </div>

      {/* Transport controls — identical to PreviewPlayer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "4px",
          background: theme.bgPanel,
          borderTop: `1px solid ${theme.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            if (isPlaying) {
              onPlayPause();
            }
            onSelectClip(null);
            onTimeUpdate(0);
          }}
          style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px", minWidth: "36px" }}
          title="Go to start"
        >
          ⏮
        </button>
        <button
          onClick={() => {
            if (!isPlaying) {
              const selClip = selectedClipId ? findClipById(project, selectedClipId) : null;
              if (selClip) {
                const clipEnd = selClip.startMs + selClip.durationMs;
                if (currentTimeMs >= clipEnd) {
                  onTimeUpdate(selClip.startMs);
                }
              } else {
                const seqEnd = getSequenceEndMs(project);
                if (seqEnd > 0 && currentTimeMs >= seqEnd) {
                  onTimeUpdate(0);
                }
              }
            }
            audioManager.ensureContext();
            onPlayPause();
          }}
          style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px", minWidth: "60px" }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={toggleMute}
          style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px", minWidth: "36px" }}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
        </button>
        <span style={{ color: theme.textMuted, fontSize: "12px" }}>
          {formatTime(currentTimeMs)}
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
          {onTogglePopout && (
            <button
              onClick={onTogglePopout}
              disabled={!!isFullscreen}
              style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px", minWidth: "36px" }}
              title={isPopout ? "Close popout" : "Open in new window"}
            >
              {isPopout ? "↙" : "↗"}
            </button>
          )}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              disabled={!!isPopout}
              style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px", minWidth: "36px" }}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              ⛶
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
