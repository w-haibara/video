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
