import { fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { AudioVolumeEditor } from "./AudioVolumeEditor";

const meta = preview.meta({
  title: "Editors/AudioVolumeEditor",
  component: AudioVolumeEditor,
  args: {
    onUpdate: fn(),
  },
});

export const Default = meta.story({
  args: {
    clip: mockClip({ volume: 1 }),
    asset: mockAsset({
      kind: "audio",
      originalPath: "/audio/track.mp3",
    }),
    trackKind: "audio",
  },
});

export const HalfVolume = meta.story({
  args: {
    clip: mockClip({ volume: 0.5 }),
    asset: mockAsset({
      kind: "audio",
      originalPath: "/audio/track.mp3",
    }),
    trackKind: "audio",
  },
});

export const Muted = meta.story({
  args: {
    clip: mockClip({ volume: 0 }),
    asset: mockAsset({
      kind: "audio",
      originalPath: "/audio/track.mp3",
    }),
    trackKind: "audio",
  },
});

Default.test("shows volume label at 100%", async ({ canvas }) => {
  await canvas.findByText(/Volume: 100%/);
});

HalfVolume.test("shows volume label at 50%", async ({ canvas }) => {
  await canvas.findByText(/Volume: 50%/);
});

Muted.test("shows volume label at 0%", async ({ canvas }) => {
  await canvas.findByText(/Volume: 0%/);
});
