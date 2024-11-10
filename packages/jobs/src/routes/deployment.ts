import { Hono } from "hono";
import { startDeployment } from "../controllers/deployment";

const app = new Hono();

app.post("/start", startDeployment);

export default app;
