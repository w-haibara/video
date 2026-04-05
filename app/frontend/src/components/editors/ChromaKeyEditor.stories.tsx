import { expect, fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { ChromaKeyEditor } from "./ChromaKeyEditor";

const meta = preview.meta({
  title: "Components/editors/ChromaKeyEditor",
  component: ChromaKeyEditor,
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

export const Disabled = meta.story({
  args: {
    clip: mockClip(),
  },
});

export const Enabled = meta.story({
  args: {
    clip: mockClip({
      chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
    }),
  },
});

export const BluePreset = meta.story({
  args: {
    clip: mockClip({
      chromaKey: { color: "#0000ff", similarity: 0.5, blend: 0.2 },
    }),
  },
});

Disabled.test("shows enable button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /Enable Chroma Key/ });
});

Disabled.test("clicking enable calls onUpdate", async ({ canvas, userEvent, args }) => {
  const button = await canvas.findByRole("button", { name: /Enable Chroma Key/ });
  await userEvent.click(button);
  expect(args.onUpdate).toHaveBeenCalled();
});

Enabled.test("shows active label", async ({ canvas }) => {
  await canvas.findByText(/Chroma Key \(active\)/);
});

Enabled.test("shows Similarity slider with 30%", async ({ canvas }) => {
  await canvas.findByText(/Similarity \(30%\)/);
});

Enabled.test("shows Remove button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /Remove Chroma Key/ });
});
