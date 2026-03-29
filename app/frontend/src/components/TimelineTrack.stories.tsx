import { fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockAsset, mockClip, storyMsToPx, storyPxToMs } from "../stories/fixtures";
import { TimelineTrack } from "./TimelineTrack";

const meta = preview.meta({
  title: "Components/TimelineTrack",
  component: TimelineTrack,
  args: {
    trackIndex: 0,
    msToPx: storyMsToPx,
    pxToMs: storyPxToMs,
    totalWidth: 1500,
    maxDurationMs: 30000,
    selectedClipIds: new Set(),
    onSelectClip: fn(),
    onMoveClip: fn(),
    onTrimClip: fn(),
    onContextMenu: fn(),
    onTrackContextMenu: fn(),
    allTrackIds: ["track-v", "track-a"],
    onDragTrackChange: fn(),
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

// --- Task 115: Mixed clip kinds in same track ---

const imageAsset = mockAsset({
  id: "asset-image",
  kind: "image",
  originalPath: "/images/photo.jpg",
  thumbnailPath: "/thumb/photo.jpg",
  durationMs: undefined,
});

const titleClip = mockClip({
  id: "clip-title",
  clipKind: "title",
  assetId: "",
  startMs: 14000,
  durationMs: 3000,
  inMs: 0,
  outMs: 3000,
  text: { value: "Title Text", fontSize: 36 },
});

const imageClip = mockClip({
  id: "clip-image",
  clipKind: "image",
  assetId: "asset-image",
  startMs: 9000,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
});

export const MixedKindTrack = meta.story({
  args: {
    track: {
      id: "track-mixed",
      clips: [mockClip(), audioClip, imageClip, titleClip],
    },
    assets: [videoAsset, audioAsset, imageAsset],
  },
});

// --- Task 120: Track header right-click menu story ---

export const TrackHeaderRightClick = meta.story({
  args: {
    track: {
      id: "track-v",
      clips: [mockClip(), secondClip],
    },
    assets: [videoAsset],
    onTrackContextMenu: fn(),
  },
});

export const DropTargetHighlight = meta.story({
  args: {
    track: {
      id: "track-v",
      clips: [mockClip()],
    },
    assets: [videoAsset],
    isDropTarget: true,
  },
});
