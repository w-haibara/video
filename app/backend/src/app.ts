import { Hono } from "hono";
import { cors } from "hono/cors";
import { projects } from "./routes/projects";
import { assets } from "./routes/assets";
import { jobsRouter } from "./routes/jobs";
import { media } from "./routes/media";

const app = new Hono();

app.use("*", cors({ origin: "http://localhost:5173" }));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message }, 500);
});

app.route("/api/projects", projects);
app.route("/api/assets", assets);
app.route("/api/jobs", jobsRouter);
app.route("/media", media);

app.get("/api/health", (c) => c.json({ ok: true }));

export { app };
