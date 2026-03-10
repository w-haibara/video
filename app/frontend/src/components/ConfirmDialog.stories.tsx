import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { ConfirmDialog } from "./ConfirmDialog";

const meta = preview.meta({
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    message: "Are you sure you want to delete this track? All clips in this track will be removed.",
    onConfirm: fn(),
    onCancel: fn(),
  },
});

export const Default = meta.story({});

export const ShortMessage = meta.story({
  args: {
    message: "Delete this item?",
  },
});

Default.test("renders dialog message", async ({ canvas }) => {
  await canvas.findByText(
    "Are you sure you want to delete this track? All clips in this track will be removed.",
  );
});

Default.test("renders Cancel and OK buttons", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "Cancel" });
  await canvas.findByRole("button", { name: "OK" });
});

Default.test("calls onCancel when Cancel is clicked", async ({ canvas, userEvent, args }) => {
  const cancelButton = await canvas.findByRole("button", { name: "Cancel" });
  await userEvent.click(cancelButton);
  await expect(args.onCancel).toHaveBeenCalled();
});

Default.test("calls onConfirm when OK is clicked", async ({ canvas, userEvent, args }) => {
  const okButton = await canvas.findByRole("button", { name: "OK" });
  await userEvent.click(okButton);
  await expect(args.onConfirm).toHaveBeenCalled();
});
