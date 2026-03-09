import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./ProjectCard.stories";

const { Default, LongName, NewProject } = composeStories(stories);

describe("ProjectCard", () => {
  it("renders project name", async () => {
    await Default.run();
    expect(document.body.textContent).toContain("My Video Project");
  });

  it("renders link to project editor", async () => {
    await Default.run();
    const link = document.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/projects/proj-1");
  });

  it("renders asset count", async () => {
    await Default.run();
    expect(document.body.textContent).toContain("2 assets");
  });

  it("renders long project name", async () => {
    await LongName.run();
    expect(document.body.textContent).toContain(
      "This Is A Very Long Project Name",
    );
  });

  it("renders new project with zero assets", async () => {
    await NewProject.run();
    expect(document.body.textContent).toContain("0 assets");
  });
});
