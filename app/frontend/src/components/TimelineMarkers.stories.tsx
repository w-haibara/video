import { expect, fn, userEvent } from "storybook/test";
import preview from "../../.storybook/preview";
import { storyMsToPx } from "../stories/fixtures";
import { TimelineMarkers } from "./TimelineMarkers";

const meta = preview.meta({
  title: "Components/TimelineMarkers",
  component: TimelineMarkers,
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
          width: "800px",
          height: "60px",
          background: "#222",
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    msToPx: storyMsToPx,
    onSelectMarker: fn(),
    onDeleteMarker: fn(),
    onUpdateMarker: fn(),
  },
});

export const Default = meta.story({
  args: {
    markers: [
      { id: "m1", timeMs: 1000 },
      { id: "m2", timeMs: 3000, label: "Scene 2" },
      { id: "m3", timeMs: 5000, label: "End", color: "#4A90E2" },
    ],
    selectedMarkerId: null,
  },
});

export const SelectedMarker = meta.story({
  args: {
    markers: [
      { id: "m1", timeMs: 1000 },
      { id: "m2", timeMs: 3000, label: "Scene 2" },
      { id: "m3", timeMs: 5000, label: "End", color: "#4A90E2" },
    ],
    selectedMarkerId: "m2",
  },
});

export const Empty = meta.story({
  args: {
    markers: [],
    selectedMarkerId: null,
  },
});

Default.test("renders marker labels", async ({ canvas }) => {
  await canvas.findByText("Scene 2");
  await canvas.findByText("End");
});

Default.test("clicking a marker calls onSelectMarker", async ({ canvas, args }) => {
  const label = await canvas.findByText("Scene 2");
  const wrapper = label.parentElement as HTMLElement;
  await userEvent.click(wrapper);
  await expect(args.onSelectMarker).toHaveBeenCalledWith("m2");
});

SelectedMarker.test("has selected marker id in args", async ({ canvas }) => {
  await canvas.findByText("Scene 2");
});

Empty.test("renders nothing", async ({ canvas }) => {
  await expect(canvas.queryAllByText(/Scene/).length).toBe(0);
});
