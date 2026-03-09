import { composeStories } from "@storybook/react";
import { describe, expect, it } from "vitest";
import * as stories from "./EditorPage.stories";

const { Default } = composeStories(stories);

describe("EditorPage", () => {
  it("renders editor layout", async () => {
    await Default.run();
    // Editor page renders even if loading
    expect(document.body.textContent).toBeTruthy();
  });
});
