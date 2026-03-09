import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./JobProgress.stories";

const { Pending, Processing, Completed, Failed } = composeStories(stories);

describe("JobProgress", () => {
  it("renders pending state", async () => {
    await Pending.run();
    expect(document.body.textContent).toContain("pending");
  });

  it("renders processing percentage", async () => {
    await Processing.run();
    expect(document.body.textContent).toContain("45%");
  });

  it("renders completed state", async () => {
    await Completed.run();
    expect(document.body.textContent).toContain("completed");
  });

  it("renders failed state", async () => {
    await Failed.run();
    expect(document.body.textContent).toContain("failed");
  });
});
