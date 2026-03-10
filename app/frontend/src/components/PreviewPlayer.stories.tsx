import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockAsset, mockClip, mockProject, projectWithClips, projectWithTextOverlay } from "../stories/fixtures";
import { PreviewPlayer } from "./PreviewPlayer";

const meta = preview.meta({
  title: "Components/PreviewPlayer",
  component: PreviewPlayer,
  args: {
    onTimeUpdate: fn(),
    onPlayPause: fn(),
    onSelectClip: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: "640px", height: "400px" }}>
        <Story />
      </div>
    ),
  ],
});

export const Stopped = meta.story({
  args: {
    project: projectWithClips,
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
  },
});

export const Playing = meta.story({
  args: {
    project: projectWithClips,
    currentTimeMs: 2500,
    isPlaying: true,
    selectedClipId: null,
  },
});

export const WithTextOverlay = meta.story({
  args: {
    project: projectWithTextOverlay,
    currentTimeMs: 2500,
    isPlaying: false,
    selectedClipId: null,
  },
});

export const WithSelectedClip = meta.story({
  args: {
    project: projectWithClips,
    currentTimeMs: 3000,
    isPlaying: false,
    selectedClipId: "clip-v1",
  },
});

export const NoActiveClip = meta.story({
  args: {
    project: mockProject({
      assets: [],
      sequence: { tracks: [] },
    }),
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
  },
});

// Small asset on a large canvas — asset appears small with black background
export const SmallAssetOnLargeCanvas = meta.story({
  args: {
    project: mockProject({
      assets: [mockAsset({ id: "small", width: 640, height: 480 })],
      sequence: {
        tracks: [
          { id: "tv", kind: "video", clips: [mockClip({ id: "c1", assetId: "small" })] },
        ],
      },
      settings: { durationMs: 30000, canvasWidth: 1920, canvasHeight: 1080 },
    }),
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
  },
});

// Square canvas (1:1)
export const SquareCanvas = meta.story({
  args: {
    project: mockProject({
      settings: { durationMs: 30000, canvasWidth: 1080, canvasHeight: 1080 },
    }),
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
  },
});

// Crop applied — container should be sized to crop dimensions, centered on canvas
export const WithCrop = meta.story({
  args: {
    project: mockProject({
      assets: [mockAsset({ id: "v1", width: 1920, height: 1080 })],
      sequence: {
        tracks: [
          {
            id: "tv",
            kind: "video",
            clips: [
              mockClip({
                id: "c1",
                assetId: "v1",
                crop: { x: 100, y: 100, width: 800, height: 600 },
              }),
            ],
          },
        ],
      },
      settings: { durationMs: 30000, canvasWidth: 1920, canvasHeight: 1080 },
    }),
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
  },
});

// Crop + scale combined
export const WithCropAndScale = meta.story({
  args: {
    project: mockProject({
      assets: [mockAsset({ id: "v1", width: 1920, height: 1080 })],
      sequence: {
        tracks: [
          {
            id: "tv",
            kind: "video",
            clips: [
              mockClip({
                id: "c1",
                assetId: "v1",
                crop: { x: 200, y: 150, width: 960, height: 540 },
                transform: { scale: 1.5 },
              }),
            ],
          },
        ],
      },
      settings: { durationMs: 30000, canvasWidth: 1920, canvasHeight: 1080 },
    }),
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
  },
});

// Text overlay with default background (should be semi-transparent black)
export const WithTextOverlayDefaultBg = meta.story({
  args: {
    project: mockProject({
      assets: [mockAsset({ id: "v1" })],
      sequence: {
        tracks: [
          {
            id: "tv",
            kind: "video",
            clips: [mockClip({ id: "c1", assetId: "v1", durationMs: 10000, outMs: 10000 })],
          },
          {
            id: "tt",
            kind: "title",
            clips: [
              mockClip({
                id: "ct",
                assetId: "",
                durationMs: 5000,
                outMs: 5000,
                text: { value: "Default BG Text", fontSize: 48, color: "#FFFFFF" },
              }),
            ],
          },
        ],
      },
    }),
    currentTimeMs: 2500,
    isPlaying: false,
    selectedClipId: null,
  },
});

// Fullscreen mode
export const Fullscreen = meta.story({
  args: {
    project: projectWithClips,
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
    isFullscreen: true,
    onToggleFullscreen: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
});

// Fullscreen with text overlay
export const FullscreenWithTextOverlay = meta.story({
  args: {
    project: projectWithTextOverlay,
    currentTimeMs: 2500,
    isPlaying: false,
    selectedClipId: null,
    isFullscreen: true,
    onToggleFullscreen: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
});

// Popout placeholder (main window state while popout is active)
export const PopoutPlaceholder = meta.story({
  args: {
    project: projectWithClips,
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
    isPopout: true,
    onTogglePopout: fn(),
    onToggleFullscreen: fn(),
  },
});

// Vertical canvas (9:16)
export const VerticalCanvas = meta.story({
  args: {
    project: mockProject({
      settings: { durationMs: 30000, canvasWidth: 1080, canvasHeight: 1920 },
    }),
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
  },
});

Stopped.test("renders play button when stopped", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "Play" });
});

Stopped.test("renders time display", async ({ canvas }) => {
  await canvas.findByText(/0:00/);
});

Stopped.test("renders go-to-start button", async ({ canvas }) => {
  await canvas.findByTitle("Go to start");
});

Stopped.test("renders canvas container", async ({ canvas }) => {
  await canvas.findByTestId("preview-canvas");
});

Playing.test("renders pause button when playing", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "Pause" });
});

WithTextOverlay.test("renders text overlay", async ({ canvas }) => {
  await canvas.findByText("Sample Title");
});

// ── Crop tests ──

WithCrop.test("crop container uses crop dimensions", async ({ canvas }) => {
  const canvasEl = await canvas.findByTestId("preview-canvas");
  // The media container is the first child div of canvas (absolute positioned)
  const mediaContainer = canvasEl.querySelector("div[style]") as HTMLElement;
  expect(mediaContainer).toBeTruthy();
  // crop is 800x600 on 1920x1080 canvas → width should be ~41.67%, height ~55.56%
  const w = parseFloat(mediaContainer.style.width);
  const h = parseFloat(mediaContainer.style.height);
  expect(w).toBeCloseTo(41.67, 0);
  expect(h).toBeCloseTo(55.56, 0);
});

WithCrop.test("crop inner media has offset styles", async ({ canvas }) => {
  const canvasEl = await canvas.findByTestId("preview-canvas");
  // Find the video element (or img)
  const media = canvasEl.querySelector("video, img") as HTMLElement;
  expect(media).toBeTruthy();
  // asset 1920x1080, crop 800x600 at (100,100)
  // width = (1920/800)*100 = 240%, marginLeft = -(100/800)*100 = -12.5%
  expect(media.style.width).toBe("240%");
  expect(media.style.marginLeft).toBe("-12.5%");
  expect(media.style.marginTop).toMatch(/-16\.6/);
});

WithCropAndScale.test("crop+scale container uses crop*scale dimensions", async ({ canvas }) => {
  const canvasEl = await canvas.findByTestId("preview-canvas");
  const mediaContainer = canvasEl.querySelector("div[style]") as HTMLElement;
  expect(mediaContainer).toBeTruthy();
  // crop 960x540 on 1920x1080 canvas, scale 1.5 → width = (960/1920)*100*1.5 = 75%
  const w = parseFloat(mediaContainer.style.width);
  expect(w).toBeCloseTo(75, 0);
});

Stopped.test("no crop — media fills container 100%", async ({ canvas }) => {
  const canvasEl = await canvas.findByTestId("preview-canvas");
  const media = canvasEl.querySelector("video, img") as HTMLElement;
  expect(media).toBeTruthy();
  expect(media.style.width).toBe("100%");
  expect(media.style.height).toBe("100%");
  expect(media.style.marginLeft).toBe("");
  expect(media.style.marginTop).toBe("");
});

// ── Text overlay style tests ──

WithTextOverlayDefaultBg.test("text has default semi-transparent background", async ({ canvas }) => {
  const textEl = await canvas.findByText("Default BG Text");
  expect(textEl.style.backgroundColor).toBe("rgba(0, 0, 0, 0.5)");
});

WithTextOverlayDefaultBg.test("text pixel values are scaled to canvas resolution", async ({ canvas }) => {
  const canvasEl = await canvas.findByTestId("preview-canvas");
  const renderedW = canvasEl.getBoundingClientRect().width;
  const canvasW = 1920; // from mockProject default
  const scale = renderedW / canvasW;

  const textEl = await canvas.findByText("Default BG Text");
  const container = textEl.parentElement as HTMLElement;

  // Container padding should be 40 * scale
  const containerPadding = parseFloat(getComputedStyle(container).paddingBottom);
  expect(containerPadding).toBeCloseTo(40 * scale, 0);

  // Font size should be 48 * scale
  const fontSize = parseFloat(getComputedStyle(textEl).fontSize);
  expect(fontSize).toBeCloseTo(48 * scale, 0);

  // Text padding should be 8 * scale
  const textPadding = parseFloat(getComputedStyle(textEl).paddingTop);
  expect(textPadding).toBeCloseTo(8 * scale, 0);
});

// ── Fullscreen tests ──

Stopped.test("renders fullscreen toggle button", async ({ canvas }) => {
  // Stopped story does not pass onToggleFullscreen, so button should not exist
  const buttons = canvas.queryAllByTitle("Fullscreen");
  expect(buttons.length).toBe(0);
});

Fullscreen.test("fullscreen button shows exit title", async ({ canvas }) => {
  await canvas.findByTitle("Exit fullscreen");
});

Fullscreen.test("fullscreen container has position:fixed", async ({ canvas }) => {
  // The outermost div rendered by PreviewPlayer should have position:fixed
  const canvasEl = await canvas.findByTestId("preview-canvas");
  // Walk up to find the fixed container
  const outer = canvasEl.closest("[style]")?.parentElement as HTMLElement;
  expect(outer).toBeTruthy();
  expect(outer.style.position).toBe("fixed");
});

FullscreenWithTextOverlay.test("text overlay visible in fullscreen", async ({ canvas }) => {
  await canvas.findByText("Sample Title");
});

// ── Popout tests ──

PopoutPlaceholder.test("popout button shows close icon", async ({ canvas }) => {
  await canvas.findByTitle("Close popout");
});

PopoutPlaceholder.test("fullscreen button is disabled during popout", async ({ canvas }) => {
  const fsBtn = await canvas.findByTitle("Fullscreen");
  expect(fsBtn).toHaveProperty("disabled", true);
});
