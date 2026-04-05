import { expect } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip, mockProject } from "../../stories/fixtures";
import type {
  ActiveClip,
  PreviewRenderContext,
} from "../../lib/preview-renderer-registry";
import { imageClipRenderer } from "./ImageClipRenderer";

const Component = imageClipRenderer.Component;

function ImageClipHost({
  content,
  ctx,
}: {
  content: ActiveClip[];
  ctx: PreviewRenderContext;
}) {
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

function buildCtx(
  project: ReturnType<typeof mockProject>,
): PreviewRenderContext {
  return {
    project,
    currentTimeMs: 0,
    canvasW: 1920,
    canvasH: 1080,
    canvasScale: 1,
    isPlaying: false,
    videoRef: { current: null } as React.RefObject<HTMLVideoElement | null>,
  };
}

// ── Fixtures ──
const imageAsset = mockAsset({
  id: "img1",
  kind: "image",
  thumbnailPath: "/thumbs/img1.jpg",
  width: 1920,
  height: 1080,
});

const baseImageClip = mockClip({
  id: "c1",
  clipKind: "image",
  assetId: "img1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
});

const baseProject = mockProject({
  assets: [imageAsset],
  sequence: { tracks: [{ id: "t1", clips: [baseImageClip] }] },
});

const singleContent: ActiveClip[] = [
  { clip: baseImageClip, asset: imageAsset, clipTimeMs: 1000, trackIndex: 0 },
];

// Chroma key variant
const chromaClip = mockClip({
  id: "c1",
  clipKind: "image",
  assetId: "img1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
  chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
});

const chromaProject = mockProject({
  assets: [imageAsset],
  sequence: { tracks: [{ id: "t1", clips: [chromaClip] }] },
});

const chromaContent: ActiveClip[] = [
  { clip: chromaClip, asset: imageAsset, clipTimeMs: 1000, trackIndex: 0 },
];

// Vignette variant
const vignetteClip = mockClip({
  id: "c1",
  clipKind: "image",
  assetId: "img1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
  videoFilters: [{ type: "vignette", strength: 0.6 }],
});

const vignetteProject = mockProject({
  assets: [imageAsset],
  sequence: { tracks: [{ id: "t1", clips: [vignetteClip] }] },
});

const vignetteContent: ActiveClip[] = [
  { clip: vignetteClip, asset: imageAsset, clipTimeMs: 1000, trackIndex: 0 },
];

const meta = preview.meta({
  title: "Components/renderers/ImageClipRenderer",
  component: ImageClipHost,
});

export const SingleImage = meta.story({
  args: {
    content: singleContent,
    ctx: buildCtx(baseProject),
  },
});

export const ImageWithChromaKey = meta.story({
  args: {
    content: chromaContent,
    ctx: buildCtx(chromaProject),
  },
});

export const ImageWithVignette = meta.story({
  args: {
    content: vignetteContent,
    ctx: buildCtx(vignetteProject),
  },
});

export const NoImages = meta.story({
  args: {
    content: [],
    ctx: buildCtx(baseProject),
  },
});

SingleImage.test("renders one img element", async ({ canvasElement }) => {
  const imgs = canvasElement.querySelectorAll("img");
  expect(imgs.length).toBe(1);
});

ImageWithChromaKey.test(
  "has chroma key canvas overlay",
  async ({ canvasElement }) => {
    // ChromaKeyOverlay mounts a <canvas> after the <img> ref is set; wait a
    // microtask tick so React can flush the post-mount render.
    await new Promise((r) => setTimeout(r, 50));
    const canvases = canvasElement.querySelectorAll("canvas");
    expect(canvases.length).toBeGreaterThan(0);
  },
);

NoImages.test("renders no img", async ({ canvasElement }) => {
  expect(canvasElement.querySelectorAll("img").length).toBe(0);
});
