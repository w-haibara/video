import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./TimelineRuler.stories";

const { Default, Short, Long } = composeStories(stories);

describe("TimelineRuler", () => {
  it("renders time markers for default duration", async () => {
    await Default.run();
    expect(document.body.textContent).toContain("0:00");
  });

  it("renders time markers for short duration", async () => {
    await Short.run();
    expect(document.body.textContent).toContain("0:00");
  });

  it("renders time markers for long duration", async () => {
    await Long.run();
    expect(document.body.textContent).toContain("0:00");
  });
});
