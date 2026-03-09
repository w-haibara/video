import type { Meta, StoryObj } from "@storybook/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createStoryQueryClient } from "../stories/fixtures";
import { JobLogPage } from "./JobLogPage";

const meta: Meta<typeof JobLogPage> = {
  title: "Pages/JobLogPage",
  component: JobLogPage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createStoryQueryClient()}>
        <MemoryRouter initialEntries={["/projects/proj-1/jobs"]}>
          <Routes>
            <Route path="/projects/:id/jobs" element={<Story />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof JobLogPage>;

export const Default: Story = {};
