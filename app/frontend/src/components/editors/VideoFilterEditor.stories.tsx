import { expect, fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { VideoFilterEditor } from "./VideoFilterEditor";

const meta = preview.meta({
  title: "Components/editors/VideoFilterEditor",
  component: VideoFilterEditor,
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

export const NoFilters = meta.story({
  args: {
    clip: mockClip(),
  },
});

export const BlurActive = meta.story({
  args: {
    clip: mockClip({
      videoFilters: [{ type: "blur", strength: 0.5 }],
    }),
  },
});

export const MultipleFilters = meta.story({
  args: {
    clip: mockClip({
      videoFilters: [
        { type: "blur", strength: 0.3 },
        { type: "sepia", strength: 0.7 },
        { type: "grain", strength: 0.4 },
      ],
    }),
  },
});

NoFilters.test("renders all 6 filter checkboxes", async ({ canvas }) => {
  await canvas.findByText("Blur");
  await canvas.findByText("Sharpen");
  await canvas.findByText("Vignette");
  await canvas.findByText("Grain");
  await canvas.findByText("Sepia");
  await canvas.findByText("Grayscale");
});

NoFilters.test("no reset button", async ({ canvas }) => {
  expect(
    canvas.queryByRole("button", { name: /Reset All Filters/ }),
  ).toBeNull();
});

BlurActive.test("shows reset button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /Reset All Filters/ });
});

BlurActive.test("shows 50% strength", async ({ canvas }) => {
  await canvas.findByText("50%");
});

MultipleFilters.test("grain shows export-only label", async ({ canvas }) => {
  await canvas.findByText(/\(export only\)/);
});

MultipleFilters.test("shows multiple percentages", async ({ canvas }) => {
  await canvas.findByText("30%");
  await canvas.findByText("70%");
  await canvas.findByText("40%");
});
