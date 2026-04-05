import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { ClipKindPopup } from "./ClipKindPopup";

const meta = preview.meta({
  title: "Components/ClipKindPopup",
  component: ClipKindPopup,
  decorators: [
    (Story) => (
      <div style={{ position: "relative", width: "400px", height: "300px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onSelect: fn(),
    onClose: fn(),
  },
});

export const Default = meta.story({
  args: {
    position: { x: 40, y: 40 },
  },
});

export const NearBottomRight = meta.story({
  args: {
    position: { x: 2000, y: 2000 },
  },
});

Default.test("renders header", async ({ canvas }) => {
  await canvas.findByText(/Add clip/i);
});

Default.test("renders at least one clip kind button", async ({ canvas }) => {
  await canvas.findByText(/Add clip/i);
  const buttons = canvas.getAllByRole("button");
  expect(buttons.length).toBeGreaterThan(0);
});

Default.test("clicking a button calls onSelect", async ({ canvas, userEvent, args }) => {
  await canvas.findByText(/Add clip/i);
  const buttons = canvas.getAllByRole("button");
  await userEvent.click(buttons[0]);
  expect(args.onSelect).toHaveBeenCalled();
});
