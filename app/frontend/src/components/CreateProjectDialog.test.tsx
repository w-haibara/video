import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./CreateProjectDialog.stories";

const { Default } = composeStories(stories);

describe("CreateProjectDialog", () => {
  it("renders dialog heading", async () => {
    await Default.run();
    const heading = document.querySelector("h2");
    expect(heading?.textContent).toBe("New Project");
  });

  it("renders project name input", async () => {
    await Default.run();
    const input = document.querySelector(
      'input[placeholder="Project name"]',
    ) as HTMLInputElement | null;
    expect(input).toBeTruthy();
  });

  it("renders cancel and create buttons", async () => {
    await Default.run();
    const buttons = Array.from(document.querySelectorAll("button"));
    const cancelBtn = buttons.find((b) => b.textContent === "Cancel");
    const createBtn = buttons.find((b) => b.textContent === "Create");
    expect(cancelBtn).toBeTruthy();
    expect(createBtn).toBeTruthy();
  });
});
