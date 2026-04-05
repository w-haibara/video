import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { KeyboardShortcutsPanel } from "./KeyboardShortcutsPanel";

const meta = preview.meta({
  title: "Components/KeyboardShortcutsPanel",
  component: KeyboardShortcutsPanel,
  args: {
    onClose: fn(),
  },
});

export const Default = meta.story({});

Default.test("renders heading", async ({ canvas }) => {
  await canvas.findByRole("heading", { name: /Keyboard Shortcuts/ });
});

Default.test("renders shortcut table rows", async ({ canvas }) => {
  const rows = canvas.getAllByRole("row");
  await expect(rows.length).toBeGreaterThan(0);
});

Default.test("close button calls onClose", async ({ canvas, userEvent, args }) => {
  const closeButton = canvas.getByRole("button", { name: "x" });
  await userEvent.click(closeButton);
  await expect(args.onClose).toHaveBeenCalled();
});
