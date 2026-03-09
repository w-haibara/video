import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./HomePage.stories";

const { Default } = composeStories(stories);

describe("HomePage", () => {
  it("renders project list heading", async () => {
    await Default.run();
    expect(document.querySelector("h1")?.textContent).toBe("Projects");
  });

  it("renders new project button", async () => {
    await Default.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const newBtn = buttons.find((b) => b.textContent?.includes("+ New Project"));
    expect(newBtn).toBeTruthy();
  });
});
