import { fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockAsset, mockClip, storyMsToPx, storyPxToMs } from "../stories/fixtures";
import { TimelineTrack } from "./TimelineTrack";

const meta = preview.meta({
  title: "Components/TimelineTrack",
  component: TimelineTrack,
  args: {
    msToPx: storyMsToPx,
    pxToMs: storyPxToMs,
    totalWidth: 1500,
    maxDurationMs: 30000,
    selectedClipId: null,
    onSelectClip: fn(),
    onMoveClip: fn(),
    onTrimClip: fn(),
    onContextMenu: fn(),
  },
});

const videoAsset = mockAsset();
const secondClip = mockClip({
  id: "clip-2",
  startMs: 6000,
  durationMs: 4000,
  inMs: 0,
  outMs: 4000,
});

export const VideoTrack = meta.story({
  args: {
    track: {
      id: "track-v",
      clips: [mockClip(), secondClip],
    },
    assets: [videoAsset],
  },
});

export const EmptyTrack = meta.story({
  args: {
    track: {
      id: "track-v",
      clips: [],
    },
    assets: [],
  },
});

const audioAsset = mockAsset({
  id: "asset-audio",
  kind: "audio",
  originalPath: "/audio/music.mp3",
  thumbnailPath: undefined,
  width: undefined,
  height: undefined,
  durationMs: 15000,
});

const audioClip = mockClip({
  id: "clip-audio",
  clipKind: "audio",
  assetId: "asset-audio",
  startMs: 1000,
  durationMs: 8000,
  inMs: 0,
  outMs: 8000,
});

export const AudioTrack = meta.story({
  args: {
    track: {
      id: "track-a",
      clips: [audioClip],
    },
    assets: [audioAsset],
  },
});
