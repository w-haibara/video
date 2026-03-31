import { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useProject } from "../api/projects";
import type { Asset } from "@video/shared";
import { CanvasCompositor, type FrameSources } from "../lib/canvas-compositor";
import { findAllActiveClips } from "../lib/preview-renderer-registry";

declare global {
  interface Window {
    __compositorTest?: {
      seek: (ms: number) => void;
      getTime: () => number;
      ready: boolean;
      frameStable: boolean;
    };
  }
}

/**
 * Resolve the media URL for an asset, same logic as PreviewPlayer.
 */
function getMediaUrl(asset: Asset, projectId: string): string {
  if ((asset.kind === "video" || asset.kind === "p5js") && asset.proxyPath) {
    if (asset.proxyPath.startsWith("render-cache/")) {
      return `/media/projects/${projectId}/${asset.proxyPath}`;
    }
    const filename = asset.proxyPath.split("/").pop();
    return `/media/projects/${projectId}/proxies/${filename}`;
  }
  if (asset.thumbnailPath) {
    const filename = asset.thumbnailPath.split("/").pop();
    return `/media/projects/${projectId}/thumbnails/${filename}`;
  }
  return "";
}

/**
 * Standalone compositor test page that renders via CanvasCompositor at
 * exact pixel size. Controlled by query parameters and a JS API exposed
 * on `window.__compositorTest` for Playwright-driven frame capture.
 *
 * Query params:
 *   project  - project ID (required)
 *   t        - initial time in ms (default 0)
 */
export function CompositorTestPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const initialTime = Number(searchParams.get("t") ?? 0);

  const { data: project, isLoading, isError } = useProject(projectId);
  const [currentTimeMs, setCurrentTimeMs] = useState(initialTime);
  const timeMsRef = useRef(currentTimeMs);
  timeMsRef.current = currentTimeMs;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compositorRef = useRef<CanvasCompositor | null>(null);
  // Media elements: assetId -> HTMLVideoElement | HTMLImageElement
  const mediaElementsRef = useRef<Map<string, HTMLVideoElement | HTMLImageElement>>(new Map());
  const [mediaReady, setMediaReady] = useState(false);
  const projectLoaded = !!project;

  const seek = useCallback((ms: number) => {
    setCurrentTimeMs(ms);
  }, []);

  // Create media elements for all assets when project loads
  useEffect(() => {
    if (!project) return;

    const elements = new Map<string, HTMLVideoElement | HTMLImageElement>();
    let loadCount = 0;
    const totalMedia = project.assets.filter(
      (a) => a.kind === "video" || a.kind === "image" || a.kind === "p5js",
    ).length;

    if (totalMedia === 0) {
      setMediaReady(true);
      return;
    }

    const onLoaded = () => {
      loadCount++;
      if (loadCount >= totalMedia) {
        setMediaReady(true);
      }
    };

    for (const asset of project.assets) {
      const url = getMediaUrl(asset, project.id);
      if (!url) continue;

      if (asset.kind === "video" || asset.kind === "p5js") {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.src = url;
        video.addEventListener("loadeddata", onLoaded, { once: true });
        video.addEventListener("error", onLoaded, { once: true });
        elements.set(asset.id, video);
      } else if (asset.kind === "image") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.addEventListener("load", onLoaded, { once: true });
        img.addEventListener("error", onLoaded, { once: true });
        elements.set(asset.id, img);
      }
    }

    mediaElementsRef.current = elements;

    return () => {
      for (const el of elements.values()) {
        if (el instanceof HTMLVideoElement) {
          el.pause();
          el.removeAttribute("src");
          el.load();
        }
      }
      elements.clear();
    };
  }, [project]);

  // Expose API for Playwright
  useEffect(() => {
    window.__compositorTest = {
      seek,
      getTime: () => timeMsRef.current,
      ready: projectLoaded && mediaReady,
      frameStable: false,
    };
    return () => {
      delete window.__compositorTest;
    };
  }, [seek, projectLoaded, mediaReady]);

  // Render frame whenever time changes
  useEffect(() => {
    if (!project || !mediaReady || !canvasRef.current) return;

    if (window.__compositorTest) {
      window.__compositorTest.frameStable = false;
    }

    // Initialize compositor on first use
    if (!compositorRef.current) {
      compositorRef.current = new CanvasCompositor(canvasRef.current);
    }

    let cancelled = false;

    const renderFrame = async () => {
      const elements = mediaElementsRef.current;

      // Determine active clips and seek each video to its clip-specific time.
      // clipTimeMs = clip.inMs + (currentTimeMs - clip.startMs) — this is
      // the time within the source media, matching findAllActiveClips logic.
      const activeClips = findAllActiveClips(project, currentTimeMs);
      const seekPromises: Promise<void>[] = [];
      for (const ac of activeClips) {
        const el = elements.get(ac.asset.id);
        if (!el || !(el instanceof HTMLVideoElement)) continue;
        const targetTimeSec = ac.clipTimeMs / 1000;
        if (Math.abs(el.currentTime - targetTimeSec) > 0.01) {
          const promise = new Promise<void>((resolve) => {
            const onSeeked = () => {
              el.removeEventListener("seeked", onSeeked);
              resolve();
            };
            el.addEventListener("seeked", onSeeked);
            el.currentTime = targetTimeSec;
          });
          seekPromises.push(promise);
        }
      }

      if (seekPromises.length > 0) {
        await Promise.all(seekPromises);
      }

      // Small delay to ensure decoded frames are ready
      await new Promise<void>((r) => setTimeout(r, 100));
      if (cancelled) return;

      // Build FrameSources map
      const sources: FrameSources = new Map();
      for (const [assetId, el] of elements) {
        sources.set(assetId, el);
      }

      // Render
      compositorRef.current!.renderFrame(project, currentTimeMs, sources);

      // Wait for next paint
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      if (cancelled) return;

      if (window.__compositorTest) {
        window.__compositorTest.frameStable = true;
      }
    };

    renderFrame();

    return () => {
      cancelled = true;
    };
  }, [currentTimeMs, project, mediaReady]);

  // Cleanup compositor
  useEffect(() => {
    return () => {
      compositorRef.current?.dispose();
      compositorRef.current = null;
    };
  }, []);

  if (!projectId) {
    return <div id="compositor-test-error">Missing ?project= param</div>;
  }
  if (isLoading) {
    return <div id="compositor-test-loading">Loading...</div>;
  }
  if (isError || !project) {
    return <div id="compositor-test-error">Project not found</div>;
  }

  const canvasW = project.settings.canvasWidth;
  const canvasH = project.settings.canvasHeight;

  return (
    <div
      style={{
        width: canvasW,
        height: canvasH,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasW}
        height={canvasH}
        data-testid="compositor-canvas"
        style={{ display: "block", width: canvasW, height: canvasH }}
      />
    </div>
  );
}
