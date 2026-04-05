import { http, HttpResponse } from "msw";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import preview from "../../.storybook/preview";
import { createStoryQueryClient, mockJob } from "../stories/fixtures";
import { JobLogPage } from "./JobLogPage";

const meta = preview.meta({
  title: "Pages/JobLogPage",
  component: JobLogPage,
  tags: ["page"],
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
});

export const Default = meta.story({
  parameters: {
    msw: {
      handlers: [
        http.get("/api/jobs/by-project/:id", () =>
          HttpResponse.json({
            jobs: [
              mockJob({ id: "job-1", status: "completed", progress: 1.0 }),
              mockJob({ id: "job-2", status: "processing", progress: 0.6 }),
              mockJob({
                id: "job-3",
                status: "failed",
                progress: 0.2,
                error: "Codec not supported",
              }),
            ],
          }),
        ),
      ],
    },
  },
});

export const Empty = meta.story({
  parameters: {
    msw: {
      handlers: [
        http.get("/api/jobs/by-project/:id", () =>
          HttpResponse.json({ jobs: [] }),
        ),
      ],
    },
  },
});

Default.test("renders job log heading", async ({ canvas }) => {
  await canvas.findByRole("heading", { name: "Job Log" });
});

Default.test("renders back to editor link", async ({ canvas }) => {
  await canvas.findByRole("link", { name: /Back to Editor/i });
});
