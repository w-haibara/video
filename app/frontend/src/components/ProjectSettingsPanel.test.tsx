import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./ProjectSettingsPanel.stories";

const { Default } = composeStories(stories);

describe("ProjectSettingsPanel", () => {
  it("renders heading", async () => {
    await Default.run();
    const heading = document.querySelector("h3");
    expect(heading?.textContent).toBe("Project Settings");
  });

  it("renders duration input", async () => {
    await Default.run();
    expect(document.body.textContent).toContain("Duration (sec)");
    const input = document.querySelector('input[type="number"]');
    expect(input).toBeTruthy();
  });

  it("renders view jobs link", async () => {
    await Default.run();
    const links = Array.from(document.querySelectorAll("a"));
    const jobsLink = links.find((a) => a.textContent?.includes("View Jobs"));
    expect(jobsLink).toBeTruthy();
  });
});
