import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockProject, projectWithClips, projectWithTextOverlay } from "../stories/fixtures";
import { PreviewPlayer } from "./PreviewPlayer";

const meta = preview.meta({
  title: "Components/PreviewPlayer",
  component: PreviewPlayer,
  args: {
    onTimeUpdate: fn(),
    onPlayPause: fn(),
    onSelectClip: fn(),
  },
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

Stopped.test("renders play button when stopped", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "Play" });
});

Stopped.test("renders time display", async ({ canvas }) => {
  await canvas.findByText(/0:00/);
});

Stopped.test("renders go-to-start button", async ({ canvas }) => {
  await canvas.findByTitle("Go to start");
});

Playing.test("renders pause button when playing", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "Pause" });
});

WithTextOverlay.test("renders text overlay", async ({ canvas }) => {
  await canvas.findByText("Sample Title");
});
