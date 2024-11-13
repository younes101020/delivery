import { Hono } from "hono";
import { startDeploymentController } from "../controllers/deployment.js";

const app = new Hono();

app.post("/start", startDeploymentController);

export default app;
