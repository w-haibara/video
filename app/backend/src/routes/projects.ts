import { Hono } from "hono";
import * as projectService from "../services/project-service";

const projects = new Hono();

projects.post("/", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  const project = await projectService.createProject(name);
  return c.json(project, 201);
});

projects.get("/", async (c) => {
  const list = await projectService.listProjects();
  return c.json({ projects: list });
});

projects.get("/:id", async (c) => {
  const project = await projectService.getProject(c.req.param("id"));
  return c.json(project);
});

projects.put("/:id", async (c) => {
  const updates = await c.req.json();
  const project = await projectService.updateProject(c.req.param("id"), updates);
  return c.json(project);
});

projects.delete("/:id", async (c) => {
  await projectService.deleteProject(c.req.param("id"));
  return c.body(null, 204);
});

export { projects };
