import { useRef } from "react";
import { expect } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip, mockProject } from "../../stories/fixtures";
import type {
  ActiveClip,
  PreviewRenderContext,
} from "../../lib/preview-renderer-registry";
import { videoClipRenderer } from "./VideoClipRenderer";

const Component = videoClipRenderer.Component;

function VideoClipHost({
  content,
  project,
}: {
  content: ActiveClip[];
  project: ReturnType<typeof mockProject>;
}) {
  // Build ctx inside the component so the self-referential videoRef is never
  // passed through Storybook's args (which would trigger a cycle warning and
  // stall the addon-vitest test runner).
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ctx: PreviewRenderContext = {
    project,
    currentTimeMs: 0,
    canvasW: 1920,
    canvasH: 1080,
    canvasScale: 1,
    isPlaying: false,
    videoRef,
  };
  return (
    <div
      style={{
        position: "relative",
        width: "320px",
        height: "180px",
        background: "#111",
      }}
    >
      <Component content={content} ctx={ctx} />
    </div>
  );
}

// ── Fixtures ──
const videoAsset = mockAsset({
  id: "v1",
  kind: "video",
  proxyPath: "/proxies/v1.mp4",
  width: 1920,
  height: 1080,
});

const baseVideoClip = mockClip({
  id: "c-single",
  clipKind: "video",
  assetId: "v1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
});

const baseProject = mockProject({
  id: "proj-single",
  assets: [videoAsset],
  sequence: { tracks: [{ id: "t1", clips: [baseVideoClip] }] },
});

const singleContent: ActiveClip[] = [
  { clip: baseVideoClip, asset: videoAsset, clipTimeMs: 1000, trackIndex: 0 },
];

// Chroma key variant
const chromaClip = mockClip({
  id: "c-chroma",
  clipKind: "video",
  assetId: "v1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
  chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
});

const chromaProject = mockProject({
  id: "proj-chroma",
  assets: [videoAsset],
  sequence: { tracks: [{ id: "t1", clips: [chromaClip] }] },
});

const chromaContent: ActiveClip[] = [
  { clip: chromaClip, asset: videoAsset, clipTimeMs: 1000, trackIndex: 0 },
];

// Vignette variant
const vignetteClip = mockClip({
  id: "c-vignette",
  clipKind: "video",
  assetId: "v1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
  videoFilters: [{ type: "vignette", strength: 0.6 }],
});

const vignetteProject = mockProject({
  id: "proj-vignette",
  assets: [videoAsset],
  sequence: { tracks: [{ id: "t1", clips: [vignetteClip] }] },
});

const vignetteContent: ActiveClip[] = [
  { clip: vignetteClip, asset: videoAsset, clipTimeMs: 1000, trackIndex: 0 },
];

const meta = preview.meta({
  title: "Components/renderers/VideoClipRenderer",
  component: VideoClipHost,
});

export const SingleVideo = meta.story({
  args: {
    content: singleContent,
    project: baseProject,
  },
});

export const VideoWithChromaKey = meta.story({
  args: {
    content: chromaContent,
    project: chromaProject,
  },
});

export const VideoWithVignette = meta.story({
  args: {
    content: vignetteContent,
    project: vignetteProject,
  },
});

export const NoVideos = meta.story({
  args: {
    content: [],
    project: baseProject,
  },
});

SingleVideo.test("renders video element", async ({ canvasElement }) => {
  const videos = canvasElement.querySelectorAll("video");
  expect(videos.length).toBe(1);
});

VideoWithChromaKey.test(
  "has chroma key canvas overlay",
  async ({ canvasElement }) => {
    await new Promise((r) => setTimeout(r, 60));
    const canvases = canvasElement.querySelectorAll("canvas");
    expect(canvases.length).toBeGreaterThan(0);
  },
);

NoVideos.test("renders no video", async ({ canvasElement }) => {
  expect(canvasElement.querySelectorAll("video").length).toBe(0);
});
