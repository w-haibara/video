import { useState, useCallback, useRef } from "react";
import type { Project, Asset } from "@video/shared";
import { theme, buttonStyle } from "../theme";
import {
  exportWithCanvas,
  isWebCodecsSupported,
} from "../lib/canvas-export";

type Props = {
  project: Project;
};

/**
 * Get the media URL for an asset (mirrors CanvasPreviewPlayer logic).
 */
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

type ExportState =
  | { status: "idle" }
  | { status: "exporting"; progress: number }
  | { status: "completed"; blob: Blob; durationMs: number; frameCount: number }
  | { status: "failed"; error: string };

export function CanvasExportPanel({ project }: Props) {
  const [state, setState] = useState<ExportState>({ status: "idle" });
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const imageElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const supported = isWebCodecsSupported();

  /**
   * Load or reuse a video element, seek to the requested time, and return it.
   */
  const getVideoFrame = useCallback(
    async (
      asset: Asset,
      clipTimeMs: number,
    ): Promise<HTMLVideoElement | null> => {
      const url = getMediaUrl(asset, project.id);
      if (!url) return null;

      let video = videoElementsRef.current.get(asset.id);
      if (!video) {
        video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.playsInline = true;
        video.preload = "auto";
        video.muted = true;
        video.src = url;
        videoElementsRef.current.set(asset.id, video);

        // Wait for video to load
        await new Promise<void>((resolve, reject) => {
          video!.addEventListener("loadeddata", () => resolve(), {
            once: true,
          });
          video!.addEventListener("error", () => reject(new Error(`Failed to load video: ${url}`)), {
            once: true,
          });
        });
      }

      // Seek to requested time
      const targetSec = clipTimeMs / 1000;
      if (
        video.readyState >= 2 &&
        Math.abs(video.currentTime - targetSec) > 0.01
      ) {
        video.currentTime = targetSec;
        await new Promise<void>((resolve) => {
          video!.addEventListener("seeked", () => resolve(), { once: true });
        });
      }

      return video;
    },
    [project.id],
  );

  /**
   * Load or reuse an image element and return it once loaded.
   */
  const getImageFrame = useCallback(
    async (asset: Asset): Promise<HTMLImageElement | null> => {
      const url = getImageUrl(asset, project.id);
      if (!url) return null;

      let img = imageElementsRef.current.get(asset.id);
      if (!img) {
        img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        imageElementsRef.current.set(asset.id, img);

        if (!img.complete) {
          await new Promise<void>((resolve, reject) => {
            img!.addEventListener("load", () => resolve(), { once: true });
            img!.addEventListener("error", () => reject(new Error(`Failed to load image: ${url}`)), {
              once: true,
            });
          });
        }
      }

      return img;
    },
    [project.id],
  );

  /**
   * getFrameSource callback passed to exportWithCanvas.
   * Resolves the assetId to the correct media element.
   */
  const getFrameSource = useCallback(
    async (
      assetId: string,
      clipTimeMs: number,
    ): Promise<CanvasImageSource | null> => {
      const asset = project.assets.find((a) => a.id === assetId);
      if (!asset) return null;

      if (asset.kind === "video" || asset.kind === "p5js") {
        return getVideoFrame(asset, clipTimeMs);
      }
      if (asset.kind === "image") {
        return getImageFrame(asset);
      }

      return null;
    },
    [project.assets, getVideoFrame, getImageFrame],
  );

  const handleExport = useCallback(async () => {
    setState({ status: "exporting", progress: 0 });

    try {
      const result = await exportWithCanvas({
        project,
        getFrameSource,
        onProgress: (progress) => {
          setState({ status: "exporting", progress });
        },
      });

      setState({
        status: "completed",
        blob: result.blob,
        durationMs: result.durationMs,
        frameCount: result.frameCount,
      });
    } catch (err) {
      setState({
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [project, getFrameSource]);

  const handleDownload = useCallback(() => {
    if (state.status !== "completed") return;
    const url = URL.createObjectURL(state.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state]);

  const handleReset = useCallback(() => {
    setState({ status: "idle" });
    // Clean up cached media elements
    for (const [, video] of videoElementsRef.current) {
      video.pause();
      video.src = "";
    }
    videoElementsRef.current.clear();
    imageElementsRef.current.clear();
  }, []);

  if (!supported) {
    return (
      <div
        style={{
          padding: "8px",
          fontSize: "12px",
          color: theme.textMuted,
        }}
      >
        <p style={{ marginBottom: "8px" }}>
          Browser Export is not available in this browser.
        </p>
        <p>
          WebCodecs API is required. Please use Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px", fontSize: "12px", color: theme.text }}>
      <div
        style={{
          marginBottom: "8px",
          color: theme.textMuted,
          fontSize: "11px",
        }}
      >
        Export video directly in the browser using WebCodecs (video only, no
        audio).
      </div>

      {state.status === "idle" && (
        <button
          onClick={handleExport}
          style={{
            width: "100%",
            padding: "8px",
            background: theme.button,
            color: theme.buttonText,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Browser Export (MP4)
        </button>
      )}

      {state.status === "exporting" && (
        <div>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: theme.bgDark,
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: `${Math.round(state.progress * 100)}%`,
                height: "100%",
                background: theme.button,
                transition: "width 0.1s ease",
              }}
            />
          </div>
          <div style={{ color: theme.textMuted, textAlign: "center" }}>
            Exporting... {Math.round(state.progress * 100)}%
          </div>
        </div>
      )}

      {state.status === "completed" && (
        <div>
          <div
            style={{
              color: theme.success,
              marginBottom: "8px",
              fontSize: "12px",
            }}
          >
            Export completed! ({state.frameCount} frames,{" "}
            {(state.durationMs / 1000).toFixed(1)}s)
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={handleDownload}
              style={{
                ...buttonStyle.primary,
                flex: 1,
                padding: "6px",
              }}
            >
              Download
            </button>
            <button
              onClick={handleReset}
              style={{
                ...buttonStyle.secondary,
                flex: 1,
                padding: "6px",
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {state.status === "failed" && (
        <div>
          <div
            style={{
              color: theme.error,
              marginBottom: "8px",
              fontSize: "12px",
            }}
          >
            Export failed: {state.error}
          </div>
          <button
            onClick={handleReset}
            style={{
              ...buttonStyle.secondary,
              width: "100%",
              padding: "6px",
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
