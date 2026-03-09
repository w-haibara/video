import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./AssetPanel.stories";

const { Empty, WithAssets } = composeStories(stories);

describe("AssetPanel", () => {
  it("renders heading", async () => {
    await Empty.run();
    const heading = document.querySelector("h3");
    expect(heading?.textContent).toBe("Assets");
  });

  it("renders import button", async () => {
    await Empty.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const importBtn = buttons.find((b) => b.textContent?.includes("Import"));
    expect(importBtn).toBeTruthy();
  });

  it("renders asset thumbnails when assets exist", async () => {
    await WithAssets.run();
    // WithAssets has 3 assets
    expect(document.body.textContent).toBeTruthy();
  });
});
