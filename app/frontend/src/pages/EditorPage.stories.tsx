import { expect } from "storybook/test";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import preview from "../../.storybook/preview";
import { createStoryQueryClient, projectWithClips } from "../stories/fixtures";
import { EditorPage } from "./EditorPage";

const meta = preview.meta({
  title: "Pages/EditorPage",
  component: EditorPage,
  tags: ["page"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={createStoryQueryClient()}>
        <MemoryRouter initialEntries={["/projects/proj-1"]}>
          <Routes>
            <Route path="/projects/:id" element={<Story />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
});

export const Default = meta.story({
  decorators: [
    (Story) => {
      const client = createStoryQueryClient();
      client.setQueryData(["projects", "proj-1"], projectWithClips);
      return (
        <QueryClientProvider client={client}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
});

Default.test("renders editor layout", async ({ canvasElement }) => {
  await expect(canvasElement.textContent?.length).toBeGreaterThan(0);
});
