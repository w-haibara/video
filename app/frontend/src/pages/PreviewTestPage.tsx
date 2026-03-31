import { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useProject } from "../api/projects";
import { PreviewPlayer } from "../components/PreviewPlayer";

declare global {
  interface Window {
    __previewTest?: {
      seek: (ms: number) => void;
      getTime: () => number;
      ready: boolean;
      frameStable: boolean;
    };
  }
}

/**
 * Standalone preview test page that renders the real PreviewPlayer at a fixed
 * pixel size.  Controlled by query parameters and a JS API exposed on
 * `window.__previewTest` for Playwright-driven frame capture.
 *
 * Query params:
 *   project  – project ID (required)
 *   t        – initial time in ms (default 0)
 */
export function PreviewTestPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const initialTime = Number(searchParams.get("t") ?? 0);

  const { data: project, isLoading, isError } = useProject(projectId);
  const [currentTimeMs, setCurrentTimeMs] = useState(initialTime);
  const timeMsRef = useRef(currentTimeMs);
  timeMsRef.current = currentTimeMs;

  const seek = useCallback((ms: number) => {
    setCurrentTimeMs(ms);
  }, []);

  // Expose API for Playwright
  useEffect(() => {
    window.__previewTest = {
      seek,
      getTime: () => timeMsRef.current,
      ready: !!project,
      frameStable: false,
    };
    return () => {
      delete window.__previewTest;
    };
  }, [seek, !!project]);

  // Mark frame as stable after React render + video seek completion.
  // Playwright waits for this before taking a screenshot.
  useEffect(() => {
    if (window.__previewTest) {
      window.__previewTest.frameStable = false;
    }

    let cancelled = false;

    const waitForStable = async () => {
      // 1. Fixed delay to allow React effects to fire and video source
      //    changes to begin.  Effects chain: setState → render → paint →
      //    useEffect(source change) → video.src = ... → loadeddata → seek.
      await new Promise<void>((r) => setTimeout(r, 300));
      if (cancelled) return;

      // 2. Poll for video readyState and seek completion (up to 3s).
      for (let attempt = 0; attempt < 60; attempt++) {
        if (cancelled) return;

        const canvas = document.querySelector('[data-testid="preview-canvas"]');
        if (!canvas) break;

        const videos = Array.from(canvas.querySelectorAll("video"));
        const allReady = videos.every((v) => {
          if (!v.src || v.src === window.location.href) return true;
          return v.readyState >= 2 && !v.seeking;
        });

        if (allReady) break;
        await new Promise<void>((r) => setTimeout(r, 50));
      }

      if (cancelled) return;

      // 3. Final frame to ensure paint
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      if (cancelled) return;

      if (window.__previewTest) {
        window.__previewTest.frameStable = true;
      }
    };

    waitForStable();

    return () => {
      cancelled = true;
    };
  }, [currentTimeMs, project]);

  if (!projectId) {
    return <div id="preview-test-error">Missing ?project= param</div>;
  }
  if (isLoading) {
    return <div id="preview-test-loading">Loading...</div>;
  }
  if (isError || !project) {
    return <div id="preview-test-error">Project not found</div>;
  }

  const canvasW = project.settings.canvasWidth;
  const canvasH = project.settings.canvasHeight;

  return (
    <div
      style={{
        // Container wide enough for canvas, tall enough for canvas + transport controls
        width: canvasW,
        height: canvasH + 50,
        overflow: "hidden",
      }}
    >
      <PreviewPlayer
        project={project}
        currentTimeMs={currentTimeMs}
        onTimeUpdate={setCurrentTimeMs}
        isPlaying={false}
        onPlayPause={() => {}}
        selectedClipId={null}
        onSelectClip={() => {}}
      />
    </div>
  );
}
