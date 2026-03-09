import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./TimelineClip.stories";

const { VideoClip, AudioClip, TextClip, Selected } = composeStories(stories);

describe("TimelineClip", () => {
  it("renders video clip with filename", async () => {
    await VideoClip.run();
    expect(document.body.textContent).toContain("sample.mp4");
  });

  it("renders audio clip with filename", async () => {
    await AudioClip.run();
    expect(document.body.textContent).toContain("track.mp3");
  });

  it("renders text clip with text value", async () => {
    await TextClip.run();
    expect(document.body.textContent).toContain("Hello World");
  });

  it("renders selected clip", async () => {
    await Selected.run();
    // Should render without error
    expect(document.body.textContent).toBeTruthy();
  });
});
