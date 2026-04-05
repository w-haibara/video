import { expect, fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { ColorCorrectionEditor } from "./ColorCorrectionEditor";

const meta = preview.meta({
  title: "Components/editors/ColorCorrectionEditor",
  component: ColorCorrectionEditor,
  args: {
    asset: mockAsset(),
    clipKind: "video",
    projectId: "proj-1",
    onUpdate: fn(),
    onSetTransition: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "12px", width: "280px", background: "#222" }}>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    clip: mockClip(),
  },
});

export const Adjusted = meta.story({
  args: {
    clip: mockClip({
      colorCorrection: {
        brightness: 0.2,
        contrast: 0.1,
        saturation: -0.3,
        hue: 45,
        temperature: 0.1,
      },
    }),
  },
});

export const BrightnessOnly = meta.story({
  args: {
    clip: mockClip({
      colorCorrection: { brightness: 0.5 },
    }),
  },
});

Default.test("renders all 5 sliders", async ({ canvas }) => {
  await canvas.findByText(/Brightness \(0%\)/);
  await canvas.findByText(/Contrast \(0%\)/);
  await canvas.findByText(/Saturation \(0%\)/);
  await canvas.findByText(/Hue \(0deg\)/);
  await canvas.findByText(/Temperature \(0%\)/);
});

Default.test("no reset button when default", async ({ canvas }) => {
  expect(
    canvas.queryByRole("button", { name: /Reset Color Correction/ }),
  ).toBeNull();
});

Adjusted.test("shows reset button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /Reset Color Correction/ });
});

Adjusted.test("brightness label shows 20%", async ({ canvas }) => {
  await canvas.findByText(/Brightness \(20%\)/);
});

Adjusted.test("hue label shows 45deg", async ({ canvas }) => {
  await canvas.findByText(/Hue \(45deg\)/);
});

BrightnessOnly.test("shows reset button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /Reset Color Correction/ });
});
