import type { Meta, StoryObj } from "@storybook/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createStoryQueryClient } from "../stories/fixtures";
import { EditorPage } from "./EditorPage";

const meta: Meta<typeof EditorPage> = {
  title: "Pages/EditorPage",
  component: EditorPage,
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
};
export default meta;

type Story = StoryObj<typeof EditorPage>;

export const Default: Story = {};
