import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./ContextMenu.stories";

const { Default, WithDisabledItem } = composeStories(stories);

describe("ContextMenu", () => {
  it("renders menu items", async () => {
    await Default.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    expect(buttons.some((b) => b.textContent === "Cut")).toBe(true);
    expect(buttons.some((b) => b.textContent === "Copy")).toBe(true);
    expect(buttons.some((b) => b.textContent === "Paste")).toBe(true);
    expect(buttons.some((b) => b.textContent === "Delete")).toBe(true);
  });

  it("renders disabled items with correct state", async () => {
    await WithDisabledItem.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const pasteBtn = buttons.find((b) => b.textContent === "Paste");
    const deleteBtn = buttons.find((b) => b.textContent === "Delete");
    expect(pasteBtn?.disabled).toBe(true);
    expect(deleteBtn?.disabled).toBe(true);
  });
});
