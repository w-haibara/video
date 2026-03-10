import { fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { TrimEditor } from "./TrimEditor";

const meta = preview.meta({
  title: "Editors/TrimEditor",
  component: TrimEditor,
  args: {
    onUpdate: fn(),
  },
});

export const VideoClip = meta.story({
  args: {
    clip: mockClip({ durationMs: 5000, inMs: 1000, outMs: 6000 }),
    asset: mockAsset({ kind: "video", durationMs: 10000 }),
    trackKind: "video",
  },
});

export const AudioClip = meta.story({
  args: {
    clip: mockClip({
      id: "clip-audio",
      assetId: "asset-audio",
      durationMs: 8000,
      inMs: 0,
      outMs: 8000,
    }),
    asset: mockAsset({
      id: "asset-audio",
      kind: "audio",
      originalPath: "/audio/track.mp3",
      durationMs: 15000,
    }),
    trackKind: "audio",
  },
});

export const TitleClip = meta.story({
  args: {
    clip: mockClip({
      id: "clip-title",
      assetId: "",
      durationMs: 3000,
      inMs: 0,
      outMs: 3000,
    }),
    asset: undefined,
    trackKind: "title",
  },
});

export const ImageClip = meta.story({
  args: {
    clip: mockClip({
      id: "clip-image",
      assetId: "asset-image",
      durationMs: 5000,
      inMs: 0,
      outMs: 5000,
    }),
    asset: mockAsset({
      id: "asset-image",
      kind: "image",
      originalPath: "/images/photo.jpg",
      durationMs: undefined,
    }),
    trackKind: "video",
  },
});

VideoClip.test("shows in/out/duration inputs for video", async ({ canvas }) => {
  await canvas.findByText("In (s)");
  await canvas.findByText("Out (s)");
  await canvas.findByText("Duration (s)");
});

TitleClip.test("shows only duration for title", async ({ canvas }) => {
  await canvas.findByText("Duration (s)");
  const inputs = canvas.getAllByRole("spinbutton");
  expect(inputs.length).toBe(1);
});
