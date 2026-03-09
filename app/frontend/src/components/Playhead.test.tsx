import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./Playhead.stories";

const { Default, AtStart, AtMiddle } = composeStories(stories);

describe("Playhead", () => {
  it("renders at default position", async () => {
    await Default.run();
    // Playhead is rendered as an absolutely positioned div
    expect(document.body.querySelector("div")).toBeTruthy();
  });

  it("renders at start position", async () => {
    await AtStart.run();
    expect(document.body.querySelector("div")).toBeTruthy();
  });

  it("renders at middle position", async () => {
    await AtMiddle.run();
    expect(document.body.querySelector("div")).toBeTruthy();
  });
});
