import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./JobLogPage.stories";

const { Default } = composeStories(stories);

describe("JobLogPage", () => {
  it("renders job log heading", async () => {
    await Default.run();
    const heading = document.querySelector("h2");
    expect(heading?.textContent).toBe("Job Log");
  });

  it("renders back to editor link", async () => {
    await Default.run();
    const links = Array.from(document.querySelectorAll("a"));
    const backLink = links.find((a) => a.textContent?.includes("Back to Editor"));
    expect(backLink).toBeTruthy();
  });
});
