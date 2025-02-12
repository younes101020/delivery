import { z } from "@hono/zod-openapi";

export const insertDeploymentSchema = z.object({
  repoUrl: z.string(),
  githubAppId: z.number(),
  port: z
    .coerce
    .number()
    .optional(),
  env: z
    .string()
    .regex(/^(?:\w+=[\w.-]+(?:\s+|$))*$/)
    .optional()
    .describe("Environment variables in KEY=value format, separated by spaces"),
  cache: z.coerce.boolean(),
  staticdeploy: z.coerce.boolean(),
  publishdir: z.string().optional(),
}).superRefine((input, ctx) => {
  if (!input.port && !input.staticdeploy) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "boolean",
      received: "undefined",
      path: ["port"],
      message: "Must be set when the deployment mode is not static",
    });
  }
  if (input.staticdeploy) {
    if (!input.publishdir) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: "string",
        received: "undefined",
        path: ["publishdir"],
        message: "Must be set when the deployment mode is static",
      });
    }
    else if (!input.publishdir.startsWith("/")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publishdir"],
        message: "Publish directory path must start with a forward slash (/)",
      });
    }
  }
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


export const currentJobCountSchema = z.object({
  count: z.number(),
});

export type InsertDeploymentSchema = z.infer<typeof insertDeploymentSchema>;
export type JobSchema = z.infer<typeof jobSchema>;
