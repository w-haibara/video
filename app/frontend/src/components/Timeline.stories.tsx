import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockAsset, mockClip, mockProject, projectWithClips } from "../stories/fixtures";
import { Timeline } from "./Timeline";

const meta = preview.meta({
  title: "Components/Timeline",
  component: Timeline,
  args: {
    onSeek: fn(),
    onSelectClip: fn(),
    onDeleteClip: fn(),
    onMoveClip: fn(),
    onTrimClip: fn(),
  },
});

export const Empty = meta.story({
  args: {
    project: mockProject({
      name: "Test Project",
      assets: [],
      sequence: {
        tracks: [
          { id: "track-v", clips: [] },
          { id: "track-a", clips: [] },
        ],
      },
    }),
    currentTimeMs: 0,
    selectedClipId: null,
  },
});

export const WithClips = meta.story({
  args: {
    project: projectWithClips,
    currentTimeMs: 5000,
    selectedClipId: null,
  },
});

export const WithSelectedClip = meta.story({
  args: {
    project: projectWithClips,
    currentTimeMs: 5000,
    selectedClipId: "clip-v1",
  },
});

Empty.test("renders zoom controls", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "+" });
  await canvas.findByRole("button", { name: "-" });
});

Empty.test("renders time display", async ({ canvas }) => {
  const matches = canvas.getAllByText(/0:00/);
  await expect(matches.length).toBeGreaterThan(0);
});

WithClips.test("renders timeline with clips", async ({ canvas }) => {
  const matches = canvas.getAllByText(/0:05/);
  await expect(matches.length).toBeGreaterThan(0);
});

export const SingleTrackWithEmptySpace = meta.story({
  args: {
    project: mockProject({
      name: "Single Track",
      sequence: {
        tracks: [
          {
            id: "track-v",
            clips: [
              {
                id: "clip-1",
                clipKind: "video",
                assetId: "asset-1",
                startMs: 0,
                durationMs: 5000,
                inMs: 0,
                outMs: 5000,
              },
            ],
          },
        ],
      },
    }),
    currentTimeMs: 2000,
    selectedClipId: null,
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ height: "300px" }}>
        <Story />
      </div>
    ),
  ],
});

WithSelectedClip.test("renders with selected clip", async ({ canvasElement }) => {
  await expect(canvasElement.textContent?.length).toBeGreaterThan(0);
});

SingleTrackWithEmptySpace.test(
  "renders with empty space below track",
  async ({ canvas }) => {
    await canvas.findByRole("button", { name: "+" });
    const matches = canvas.getAllByText(/0:02/);
    await expect(matches.length).toBeGreaterThan(0);
  },
);

// --- Task 115: Mixed clip kinds and multi-layer stories ---

export const MixedClipKinds = meta.story({
  args: {
    project: mockProject({
      name: "Mixed Clips",
      assets: [
        mockAsset({ id: "asset-v1" }),
        mockAsset({ id: "asset-a1", kind: "audio", originalPath: "/audio/bgm.mp3", thumbnailPath: undefined, width: undefined, height: undefined, durationMs: 15000 }),
        mockAsset({ id: "asset-i1", kind: "image", originalPath: "/images/photo.jpg", durationMs: undefined }),
      ],
      sequence: {
        tracks: [
          {
            id: "track-1",
            clips: [
              mockClip({ id: "clip-v1", clipKind: "video", assetId: "asset-v1", startMs: 0, durationMs: 5000, outMs: 5000 }),
              mockClip({ id: "clip-a1", clipKind: "audio", assetId: "asset-a1", startMs: 5000, durationMs: 8000, outMs: 8000 }),
              mockClip({ id: "clip-i1", clipKind: "image", assetId: "asset-i1", startMs: 13000, durationMs: 3000, outMs: 3000 }),
            ],
          },
        ],
      },
    }),
    currentTimeMs: 0,
    selectedClipId: null,
  },
});

MixedClipKinds.test("renders clips with different kinds in same track", async ({ canvasElement }) => {
  await expect(canvasElement.textContent?.length).toBeGreaterThan(0);
});

export const MultiLayerTracks = meta.story({
  args: {
    project: mockProject({
      name: "Multi Layer",
      assets: [
        mockAsset({ id: "asset-v1" }),
        mockAsset({ id: "asset-v2", originalPath: "/videos/sample2.mp4" }),
      ],
      sequence: {
        tracks: [
          {
            id: "layer-1",
            clips: [
              mockClip({ id: "clip-l1-1", clipKind: "video", assetId: "asset-v1", startMs: 0, durationMs: 10000, outMs: 10000 }),
            ],
          },
          {
            id: "layer-2",
            clips: [
              mockClip({ id: "clip-l2-1", clipKind: "video", assetId: "asset-v2", startMs: 2000, durationMs: 5000, outMs: 5000, blendMode: "cover" }),
            ],
          },
          {
            id: "layer-3",
            clips: [
              mockClip({ id: "clip-t1", clipKind: "title", assetId: "", startMs: 1000, durationMs: 3000, outMs: 3000, text: { value: "Layer 3 Text", fontSize: 48, color: "#FFFFFF" } }),
            ],
          },
        ],
      },
    }),
    currentTimeMs: 3000,
    selectedClipId: null,
  },
});

MultiLayerTracks.test("renders multiple layer tracks", async ({ canvasElement }) => {
  await expect(canvasElement.textContent?.length).toBeGreaterThan(0);
});

// --- Task 120: Track operation stories ---

export const CrossTrackDrag = meta.story({
  args: {
    project: mockProject({
      name: "Cross-Track Drag",
      assets: [
        mockAsset({ id: "asset-v1" }),
        mockAsset({ id: "asset-v2", originalPath: "/videos/sample2.mp4" }),
      ],
      sequence: {
        tracks: [
          {
            id: "layer-1",
            clips: [
              mockClip({ id: "clip-l1-1", clipKind: "video", assetId: "asset-v1", startMs: 0, durationMs: 8000, outMs: 8000 }),
            ],
          },
          {
            id: "layer-2",
            clips: [
              mockClip({ id: "clip-l2-1", clipKind: "video", assetId: "asset-v2", startMs: 2000, durationMs: 5000, outMs: 5000 }),
            ],
          },
        ],
      },
    }),
    currentTimeMs: 0,
    selectedClipId: null,
  },
});

CrossTrackDrag.test("renders multiple tracks for cross-track drag", async ({ canvasElement }) => {
  await expect(canvasElement.textContent?.length).toBeGreaterThan(0);
  // Both track labels should be visible
  await expect(canvasElement.textContent).toContain("1");
  await expect(canvasElement.textContent).toContain("2");
});

export const WithAddTrackButton = meta.story({
  args: {
    project: mockProject({
      name: "Add Track Button",
      sequence: {
        tracks: [
          {
            id: "track-1",
            clips: [
              mockClip({ id: "clip-1", clipKind: "video", assetId: "asset-1", startMs: 0, durationMs: 5000, outMs: 5000 }),
            ],
          },
        ],
      },
    }),
    currentTimeMs: 0,
    selectedClipId: null,
    onAddTrack: fn(),
  },
});

WithAddTrackButton.test("renders add track + button", async ({ canvas }) => {
  // The add track row renders a "+" button
  const buttons = await canvas.findAllByRole("button", { name: "+" });
  await expect(buttons.length).toBeGreaterThan(0);
});

WithAddTrackButton.test("calls onAddTrack when + button is clicked", async ({ canvas, userEvent, args }) => {
  const buttons = await canvas.findAllByRole("button", { name: "+" });
  // The last "+" button is the add-track button (zoom "+" is first)
  const addTrackButton = buttons[buttons.length - 1];
  await userEvent.click(addTrackButton);
  await expect(args.onAddTrack).toHaveBeenCalled();
});

export const TrackHeaderContextMenu = meta.story({
  args: {
    project: mockProject({
      name: "Track Context Menu",
      assets: [mockAsset({ id: "asset-v1" })],
      sequence: {
        tracks: [
          {
            id: "track-1",
            clips: [
              mockClip({ id: "clip-1", clipKind: "video", assetId: "asset-v1", startMs: 0, durationMs: 5000, outMs: 5000 }),
            ],
          },
          {
            id: "track-2",
            clips: [
              mockClip({ id: "clip-2", clipKind: "video", assetId: "asset-v1", startMs: 0, durationMs: 3000, outMs: 3000 }),
            ],
          },
        ],
      },
    }),
    currentTimeMs: 0,
    selectedClipId: null,
    onDeleteTrack: fn(),
  },
});

TrackHeaderContextMenu.test("renders two track headers", async ({ canvasElement }) => {
  await expect(canvasElement.textContent).toContain("1");
  await expect(canvasElement.textContent).toContain("2");
});
