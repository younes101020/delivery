import { z } from "zod";

export const insertDeploymentSchema = z.object({
  repoUrl: z.string(),
  githubAppId: z.number(),
  port: z
    .string()
    .regex(/^\d+(?::\d+)?$/, { message: "The port format is invalid" })
    .transform(port => `-p ${port}`)
    .describe("Port number or port mapping in format port:port"),
  env: z
    .string()
    .regex(/^(?:\w+=[\w.-]+(?:\s+|$))*$/)
    .optional()
    .describe("Environment variables in KEY=value format, separated by spaces"),
  cache: z.coerce.boolean(),
});

export const slugParamsSchema = z.object({
  slug: z.string().describe("Repository name identifier for the deployment, act as the queue name"),
});

export const deploymentTrackerIdentifier = z.object({
  queueName: z.string(),
});

export type InsertDeploymentSchema = z.infer<typeof insertDeploymentSchema>;
