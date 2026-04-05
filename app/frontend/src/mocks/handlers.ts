import { http, HttpResponse } from "msw";
import { mockJob, mockProject } from "../stories/fixtures";

/**
 * Default MSW handlers for Storybook.
 *
 * These provide sensible empty/default responses so data-fetching stories
 * render their loaded state instead of error state. Individual stories can
 * override these via `parameters.msw.handlers` for richer scenarios.
 */
export const handlers = [
  http.get("/api/projects", () => HttpResponse.json({ projects: [] })),
  http.get("/api/projects/:id", ({ params }) =>
    HttpResponse.json(mockProject({ id: params.id as string })),
  ),
  http.get("/api/jobs/:id", ({ params }) =>
    HttpResponse.json(mockJob({ id: params.id as string })),
  ),
  http.get("/api/jobs/by-project/:id", () => HttpResponse.json({ jobs: [] })),
];
