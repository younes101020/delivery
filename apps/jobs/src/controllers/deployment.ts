import { Context } from "hono";
import { startDeployment } from "../services/deployment.js";

export const startDeploymentController = async (c: Context) => {
  const result = await startDeployment();
  if (result.stderr) {
    return c.json({ error: result.stderr }, 500);
  }
  return c.json(result);
};
