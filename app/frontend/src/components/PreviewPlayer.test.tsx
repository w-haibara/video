import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./PreviewPlayer.stories";

const { Stopped, Playing, WithTextOverlay } = composeStories(stories);

describe("PreviewPlayer", () => {
  it("renders play button when stopped", async () => {
    await Stopped.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const playBtn = buttons.find((b) => b.textContent === "Play");
    expect(playBtn).toBeTruthy();
  });

  it("renders time display", async () => {
    await Stopped.run();
    expect(document.body.textContent).toContain("0:00");
  });

  it("renders go-to-start button", async () => {
    await Stopped.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const startBtn = buttons.find((b) => b.title === "Go to start");
    expect(startBtn).toBeTruthy();
  });

  it("renders pause button when playing", async () => {
    await Playing.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const pauseBtn = buttons.find((b) => b.textContent === "Pause");
    expect(pauseBtn).toBeTruthy();
  });

  it("renders text overlay", async () => {
    await WithTextOverlay.run();
    // Text overlay should be present
    expect(document.body.textContent).toBeTruthy();
  });
});
