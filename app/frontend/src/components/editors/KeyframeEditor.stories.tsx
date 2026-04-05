import { expect, fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { KeyframeEditor } from "./KeyframeEditor";

const meta = preview.meta({
  title: "Components/editors/KeyframeEditor",
  component: KeyframeEditor,
  args: {
    asset: mockAsset(),
    clipKind: "video",
    projectId: "proj-1",
    onUpdate: fn(),
    onSetTransition: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "12px", width: "320px", background: "#222" }}>
        <Story />
      </div>
    ),
  ],
});

export const Empty = meta.story({
  args: {
    clip: mockClip(),
  },
});

export const WithKeyframes = meta.story({
  args: {
    clip: mockClip({
      keyframeTracks: [
        {
          property: "transform.x",
          keyframes: [
            { timeMs: 0, value: 0, easing: "linear" },
            { timeMs: 2000, value: 100, easing: "ease-in-out" },
          ],
        },
        {
          property: "opacity",
          keyframes: [{ timeMs: 1000, value: 0.5, easing: "ease-out" }],
        },
      ],
    }),
  },
});

export const ScaleAnimation = meta.story({
  args: {
    clip: mockClip({
      transform: { scale: 1.5 },
      keyframeTracks: [
        {
          property: "transform.scale",
          keyframes: [
            { timeMs: 0, value: 1, easing: "linear" },
            { timeMs: 3000, value: 2, easing: "ease-in" },
          ],
        },
      ],
    }),
  },
});

Empty.test("renders keyframe editor container", async ({ canvas }) => {
  await canvas.findByTestId("keyframe-editor");
});

Empty.test("shows empty hint", async ({ canvas }) => {
  await canvas.findByText(/No keyframes/);
});

Empty.test("renders all 6 property rows", async ({ canvas }) => {
  await canvas.findByText(/Position X/);
  await canvas.findByText(/Position Y/);
  await canvas.findByText(/Scale/);
  await canvas.findByText(/Rotation/);
  await canvas.findByText(/Opacity/);
  await canvas.findByText(/Volume/);
});

WithKeyframes.test("shows keyframe count for transform.x", async ({ canvas }) => {
  const matches = await canvas.findAllByText(/2 kf/);
  expect(matches.length).toBeGreaterThan(0);
});

WithKeyframes.test("has add button for opacity", async ({ canvas }) => {
  await canvas.findByTestId("add-keyframe-opacity");
});

ScaleAnimation.test("shows scale keyframe count", async ({ canvas }) => {
  const matches = await canvas.findAllByText(/2 kf/);
  expect(matches.length).toBeGreaterThan(0);
});
