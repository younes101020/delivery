import { z } from "zod";

export const insertDeploymentSchema = z.object({
  repoUrl: z.string().url(),
  githubAppId: z.number(),
});

export const deploymentTrackerIdentifier = z.object({
  queueName: z.string(),
});

export type InsertDeploymentSchema = z.infer<typeof insertDeploymentSchema>;
