import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { ContextMenu } from "./ContextMenu";

const meta = preview.meta({
  title: "Components/ContextMenu",
  component: ContextMenu,
  args: {
    onClose: fn(),
  },
});

export const Default = meta.story({
  args: {
    items: [
      { label: "Cut", onClick: fn() },
      { label: "Copy", onClick: fn() },
      { label: "Paste", onClick: fn() },
      { label: "Delete", onClick: fn() },
    ],
    position: { x: 100, y: 100 },
  },
});

Default.test("calls onClick when a menu item is clicked", async ({ canvas, userEvent, args }) => {
  const cutItem = await canvas.findByText("Cut");
  await userEvent.click(cutItem);
  await expect(args.items[0].onClick).toHaveBeenCalled();
});

export const WithDisabledItem = meta.story({
  args: {
    items: [
      { label: "Cut", onClick: fn() },
      { label: "Copy", onClick: fn() },
      { label: "Paste", onClick: fn(), disabled: true },
      { label: "Delete", onClick: fn(), disabled: true },
    ],
    position: { x: 100, y: 100 },
  },
});

Default.test("renders menu items", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "Cut" });
  await canvas.findByRole("button", { name: "Copy" });
  await canvas.findByRole("button", { name: "Paste" });
  await canvas.findByRole("button", { name: "Delete" });
});

WithDisabledItem.test("renders disabled items with correct state", async ({ canvas }) => {
  await expect(await canvas.findByRole("button", { name: "Paste" })).toBeDisabled();
  await expect(await canvas.findByRole("button", { name: "Delete" })).toBeDisabled();
});
