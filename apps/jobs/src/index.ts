import { serve } from "@hono/node-server";
import { Hono } from "hono";
import deployment from "./routes/deployment.js";

const app = new Hono();

app.route("/api/deployment", deployment);

serve({
  fetch: app.fetch,
  port: 3090,
});
