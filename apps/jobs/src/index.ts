import { Hono } from "hono";
import deployment from "./routes/deployment";

const app = new Hono();

app.route("/api/deployment", deployment);

export default app;
