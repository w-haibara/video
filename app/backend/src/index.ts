import { Hono } from "hono";

const app = new Hono();
app.get("/api/health", (c) => c.json({ ok: true }));

export default { port: 3000, hostname: "127.0.0.1", fetch: app.fetch };
