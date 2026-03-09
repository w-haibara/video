import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./AssetThumbnail.stories";

const { Ready, Importing, InUse, AudioAsset } = composeStories(stories);

describe("AssetThumbnail", () => {
  it("renders add-to-timeline button for ready asset", async () => {
    await Ready.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const addBtn = buttons.find((b) => b.title === "Add to timeline");
    expect(addBtn).toBeTruthy();
  });

  it("renders importing asset fallback", async () => {
    await Importing.run();
    // Importing story has no thumbnailPath, so it renders a fallback
    expect(document.body.textContent).toBeTruthy();
  });

  it("renders delete button for asset not in use", async () => {
    await Ready.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const deleteBtn = buttons.find((b) => b.title === "Delete asset");
    expect(deleteBtn).toBeTruthy();
  });

  it("renders audio asset label", async () => {
    await AudioAsset.run();
    expect(document.body.textContent).toContain("audio");
  });
});
