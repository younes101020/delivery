import { z } from "zod";

export const insertDeploymentSchema = z.object({
  repoUrl: z.string().url(),
  githubAppId: z.number(),
  port: z
    .string()
    .regex(/^\d+(?::\d+)?$/)
    .transform(port => `-p ${port}`)
    .describe("Port number or port mapping in format port:port"),
  env: z
    .string()
    .regex(/^(?:\w+=[\w.-]+(?:\s+|$))*$/)
    .transform((str) => {
      if (!str) {
        return str;
      }
      return str
        .trim()
        .split(/\s+/)
        .map(v => `-e ${v}`)
        .join(" ");
    })
    .optional()
    .describe("Environment variables in KEY=value format, separated by spaces"),
});

export const deploymentTrackerIdentifier = z.object({
  queueName: z.string(),
});

export type InsertDeploymentSchema = z.infer<typeof insertDeploymentSchema>;
