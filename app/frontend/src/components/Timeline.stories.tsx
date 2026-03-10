import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockProject, projectWithClips } from "../stories/fixtures";
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
