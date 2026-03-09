import { expect, fn } from "storybook/test";
import preview from "../../.storybook/preview";
import { SaveIndicator } from "./SaveIndicator";

const meta = preview.meta({
  title: "Components/SaveIndicator",
  component: SaveIndicator,
  args: {
    onUndo: fn(),
    onRedo: fn(),
  },
});

export const Idle = meta.story({
  args: {
    status: "idle",
    canUndo: false,
    canRedo: false,
  },
});

export const Saving = meta.story({
  args: {
    status: "saving",
    canUndo: false,
    canRedo: false,
  },
});

export const Saved = meta.story({
  args: {
    status: "saved",
    canUndo: false,
    canRedo: false,
  },
});

export const Error = meta.story({
  args: {
    status: "error",
    canUndo: false,
    canRedo: false,
  },
});

export const WithUndoRedo = meta.story({
  args: {
    status: "saved",
    canUndo: true,
    canRedo: true,
  },
});

WithUndoRedo.test("calls onUndo when undo button is clicked", async ({ canvas, userEvent, args }) => {
  const undoButton = await canvas.findByRole("button", { name: /undo/i });
  await userEvent.click(undoButton);
  await expect(args.onUndo).toHaveBeenCalled();
});

Idle.test("renders undo and redo buttons", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /undo/i });
  await canvas.findByRole("button", { name: /redo/i });
});

Idle.test("disables undo/redo when canUndo/canRedo is false", async ({ canvas }) => {
  await expect(await canvas.findByRole("button", { name: /undo/i })).toBeDisabled();
  await expect(await canvas.findByRole("button", { name: /redo/i })).toBeDisabled();
});

Saving.test("shows saving status", async ({ canvas }) => {
  await canvas.findByText("Saving...");
});

Saved.test("shows saved status", async ({ canvas }) => {
  await canvas.findByText("Saved");
});

Error.test("shows error status", async ({ canvas }) => {
  await canvas.findByText("Save failed");
});

WithUndoRedo.test("enables undo/redo buttons when available", async ({ canvas }) => {
  await expect(await canvas.findByRole("button", { name: /undo/i })).toBeEnabled();
  await expect(await canvas.findByRole("button", { name: /redo/i })).toBeEnabled();
});
