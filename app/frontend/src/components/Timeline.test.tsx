import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./Timeline.stories";

const { Empty, WithClips, WithSelectedClip } = composeStories(stories);

describe("Timeline", () => {
  it("renders zoom controls", async () => {
    await Empty.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const zoomIn = buttons.find((b) => b.textContent === "+");
    const zoomOut = buttons.find((b) => b.textContent === "-");
    expect(zoomIn).toBeTruthy();
    expect(zoomOut).toBeTruthy();
  });

  it("renders time display", async () => {
    await Empty.run();
    expect(document.body.textContent).toContain("0:00");
  });

  it("renders timeline with clips", async () => {
    await WithClips.run();
    // Should display time indicator
    expect(document.body.textContent).toContain("0:05");
  });

  it("renders with selected clip", async () => {
    await WithSelectedClip.run();
    // Should render without error
    expect(document.body.textContent).toBeTruthy();
  });
});
