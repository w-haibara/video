import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockAsset, mockClip, mockProject } from "../stories/fixtures";
import { InspectorPanel } from "./InspectorPanel";

const meta = preview.meta({
  title: "Components/InspectorPanel",
  component: InspectorPanel,
  args: {
    onUpdateClip: fn(),
    onMoveClip: fn(),
  },
});

export const NoSelection = meta.story({
  args: {
    project: mockProject(),
    selectedClipId: null,
  },
});

export const VideoClip = meta.story({
  args: {
    project: mockProject(),
    selectedClipId: "clip-1",
  },
});

const audioAsset = mockAsset({
  id: "asset-audio",
  kind: "audio",
  originalPath: "/audio/track.mp3",
  thumbnailPath: undefined,
  width: undefined,
  height: undefined,
  durationMs: 15000,
});

const audioClip = mockClip({
  id: "clip-audio",
  clipKind: "audio",
  assetId: "asset-audio",
  durationMs: 8000,
  outMs: 8000,
  volume: 0.75,
});

export const AudioClip = meta.story({
  args: {
    project: mockProject({
      assets: [mockAsset(), audioAsset],
      sequence: {
        tracks: [
          { id: "track-v", clips: [mockClip()] },
          { id: "track-a", clips: [audioClip] },
        ],
      },
    }),
    selectedClipId: "clip-audio",
  },
});

const textClip = mockClip({
  id: "clip-text",
  clipKind: "title",
  assetId: "",
  durationMs: 3000,
  outMs: 3000,
  text: { value: "Hello World", fontSize: 48 },
});

export const TextClip = meta.story({
  args: {
    project: mockProject({
      sequence: {
        tracks: [
          { id: "track-v", clips: [mockClip()] },
          { id: "track-a", clips: [] },
          { id: "track-t", clips: [textClip] },
        ],
      },
    }),
    selectedClipId: "clip-text",
  },
});

export const ClipNotFound = meta.story({
  args: {
    project: mockProject(),
    selectedClipId: "nonexistent-clip",
  },
});

const imageAsset = mockAsset({
  id: "asset-image",
  kind: "image",
  originalPath: "/images/photo.jpg",
  durationMs: undefined,
});

const imageClip = mockClip({
  id: "clip-image",
  assetId: "asset-image",
  durationMs: 5000,
  outMs: 5000,
});

export const ImageClip = meta.story({
  args: {
    project: mockProject({
      assets: [mockAsset(), imageAsset],
      sequence: {
        tracks: [
          {
            id: "track-v",
            clips: [mockClip(), imageClip],
          },
          { id: "track-a", clips: [] },
        ],
      },
    }),
    selectedClipId: "clip-image",
  },
});

NoSelection.test("shows placeholder when no clip is selected", async ({ canvas }) => {
  await canvas.findByText(/Select a clip/);
});

VideoClip.test("shows trim inputs for video clip", async ({ canvas }) => {
  await canvas.findByText(/Trim/);
});

VideoClip.test("shows rotation buttons for video clip", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "0°" });
});

AudioClip.test("shows volume slider for audio clip", async ({ canvas }) => {
  await canvas.findByText(/Volume/);
});

TextClip.test("shows text editor for text clip", async ({ canvas }) => {
  await canvas.findByRole("textbox");
});
