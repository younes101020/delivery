import { z } from "@hono/zod-openapi";

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

export const queueSchema = z.object({
  queueName: z.string(),
});

export const jobIdParamsSchema = z.object({
  jobId: z.string(),
});

export const deploymentTrackerIdentifier = z.object({
  queueName: z.string(),
});

export const jobSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  repoName: z.string(),
  stacktrace: z.array(z.string().optional()),
});

export type InsertDeploymentSchema = z.infer<typeof insertDeploymentSchema>;
export type JobSchema = z.infer<typeof jobSchema>;
