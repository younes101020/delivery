import { Context } from "hono";

export const startDeployment = async (c: Context) => {
  return c.text("Hello World");
};
