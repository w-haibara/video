import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./InspectorPanel.stories";

const { NoSelection, VideoClip, AudioClip, TextClip } = composeStories(stories);

describe("InspectorPanel", () => {
  it("shows placeholder when no clip is selected", async () => {
    await NoSelection.run();
    expect(document.body.textContent).toContain("Select a clip to view details");
  });

  it("shows trim inputs for video clip", async () => {
    await VideoClip.run();
    const labels = Array.from(document.querySelectorAll("label"));
    const trimLabel = labels.find((l) => l.textContent?.includes("Trim"));
    expect(trimLabel).toBeTruthy();
  });

  it("shows rotation buttons for video clip", async () => {
    await VideoClip.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const rotBtn = buttons.find((b) => b.textContent === "0°");
    expect(rotBtn).toBeTruthy();
  });

  it("shows volume slider for audio clip", async () => {
    await AudioClip.run();
    expect(document.body.textContent).toContain("Volume");
  });

  it("shows text editor for text clip", async () => {
    await TextClip.run();
    const textareas = document.querySelectorAll("textarea");
    expect(textareas.length).toBeGreaterThan(0);
  });
});
