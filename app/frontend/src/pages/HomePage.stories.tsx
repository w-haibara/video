import { http, HttpResponse } from "msw";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import preview from "../../.storybook/preview";
import { createStoryQueryClient, mockAsset, mockProject } from "../stories/fixtures";
import { HomePage } from "./HomePage";

const meta = preview.meta({
  title: "Pages/HomePage",
  component: HomePage,
  tags: ["page"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={createStoryQueryClient()}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
});

export const Default = meta.story({});

export const WithProjects = meta.story({
  parameters: {
    msw: {
      handlers: [
        http.get("/api/projects", () =>
          HttpResponse.json({
            projects: [
              mockProject(),
              mockProject({
                id: "proj-2",
                name: "Another Project",
                assets: [
                  mockAsset({
                    id: "asset-2",
                    kind: "audio",
                    thumbnailPath: undefined,
                  }),
                ],
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
        http.get("/api/projects", () => HttpResponse.json({ projects: [] })),
      ],
    },
  },
});

Default.test("renders project list heading", async ({ canvas }) => {
  await canvas.findByRole("heading", { name: "Projects" });
});

Default.test("renders new project button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /New Project/i });
});
