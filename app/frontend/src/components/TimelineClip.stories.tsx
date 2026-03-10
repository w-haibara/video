import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockAsset, mockClip, storyMsToPx, storyPxToMs } from "../stories/fixtures";
import { TimelineClip } from "./TimelineClip";

const meta = preview.meta({
  title: "Components/TimelineClip",
  component: TimelineClip,
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: 40, width: "100%" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    msToPx: storyMsToPx,
    pxToMs: storyPxToMs,
    maxDurationMs: 30000,
    onSelect: fn(),
    onMove: fn(),
    onTrim: fn(),
    onContextMenu: fn(),
  },
});

export const VideoClip = meta.story({
  args: {
    clip: mockClip(),
    asset: mockAsset(),
    trackKind: "video",
    isSelected: false,
  },
});

export const AudioClip = meta.story({
  args: {
    clip: mockClip({
      id: "clip-audio",
      assetId: "asset-audio",
      durationMs: 8000,
      outMs: 8000,
    }),
    asset: mockAsset({
      id: "asset-audio",
      kind: "audio",
      originalPath: "/audio/track.mp3",
      thumbnailPath: undefined,
      width: undefined,
      height: undefined,
      durationMs: 15000,
    }),
    trackKind: "audio",
    isSelected: false,
  },
});

export const TextClip = meta.story({
  args: {
    clip: mockClip({
      id: "clip-text",
      assetId: "",
      durationMs: 3000,
      outMs: 3000,
      text: { value: "Hello World", fontSize: 48 },
    }),
    asset: undefined,
    trackKind: "title",
    isSelected: false,
  },
});

export const Selected = meta.story({
  args: {
    clip: mockClip(),
    asset: mockAsset(),
    trackKind: "video",
    isSelected: true,
  },
});

VideoClip.test("renders video clip with filename", async ({ canvas }) => {
  await canvas.findByText(/sample\.mp4/);
});

AudioClip.test("renders audio clip with filename", async ({ canvas }) => {
  await canvas.findByText(/track\.mp3/);
});

TextClip.test("renders text clip with text value", async ({ canvas }) => {
  await canvas.findByText(/Hello World/);
});

Selected.test("renders selected clip", async ({ canvas }) => {
  await expect(canvas.getByText(/.+/)).toBeTruthy();
});
