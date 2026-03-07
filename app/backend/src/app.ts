import { Hono } from "hono";
import { cors } from "hono/cors";
import { projects } from "./routes/projects";

const app = new Hono();

app.use("*", cors({ origin: "http://localhost:5173" }));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message }, 500);
});

app.route("/api/projects", projects);

app.get("/api/health", (c) => c.json({ ok: true }));

export { app };
