import { fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockProject, projectWithClips, projectWithTextOverlay } from "../stories/fixtures";
import { CanvasPreviewPlayer } from "./CanvasPreviewPlayer";

const meta = preview.meta({
  title: "Components/CanvasPreviewPlayer",
  component: CanvasPreviewPlayer,
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

Stopped.test("renders play button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "Play" });
});

Stopped.test("renders time display", async ({ canvas }) => {
  await canvas.findByText(/0:00/);
});

Stopped.test("renders go-to-start button", async ({ canvas }) => {
  await canvas.findByTitle("Go to start");
});

Stopped.test("renders canvas element", async ({ canvas }) => {
  await canvas.findByTestId("preview-canvas");
});

Playing.test("renders pause button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "Pause" });
});

NoActiveClip.test("shows placeholder text", async ({ canvas }) => {
  await canvas.findByText(/No clip at playhead/);
});

Fullscreen.test("fullscreen button shows exit title", async ({ canvas }) => {
  await canvas.findByTitle("Exit fullscreen");
});

PopoutPlaceholder.test("popout button shows close icon", async ({ canvas }) => {
  await canvas.findByTitle("Close popout");
});
