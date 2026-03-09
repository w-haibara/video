import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./SaveIndicator.stories";

const { Idle, Saving, Saved, Error, WithUndoRedo } = composeStories(stories);

describe("SaveIndicator", () => {
  it("renders undo and redo buttons", async () => {
    await Idle.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const undoBtn = buttons.find((b) => b.title === "Undo (Ctrl+Z)");
    const redoBtn = buttons.find((b) => b.title === "Redo (Ctrl+Shift+Z)");
    expect(undoBtn).toBeTruthy();
    expect(redoBtn).toBeTruthy();
  });

  it("disables undo/redo when canUndo/canRedo is false", async () => {
    await Idle.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const undoBtn = buttons.find((b) => b.title === "Undo (Ctrl+Z)");
    const redoBtn = buttons.find((b) => b.title === "Redo (Ctrl+Shift+Z)");
    expect(undoBtn?.disabled).toBe(true);
    expect(redoBtn?.disabled).toBe(true);
  });

  it("shows saving status", async () => {
    await Saving.run();
    expect(document.body.textContent).toContain("Saving...");
  });

  it("shows saved status", async () => {
    await Saved.run();
    expect(document.body.textContent).toContain("Saved");
  });

  it("shows error status", async () => {
    await Error.run();
    expect(document.body.textContent).toContain("Save failed");
  });

  it("enables undo/redo buttons when available", async () => {
    await WithUndoRedo.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const undoBtn = buttons.find((b) => b.title === "Undo (Ctrl+Z)");
    const redoBtn = buttons.find((b) => b.title === "Redo (Ctrl+Shift+Z)");
    expect(undoBtn?.disabled).toBe(false);
    expect(redoBtn?.disabled).toBe(false);
  });
});
