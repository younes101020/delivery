import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { rbacMiddleware } from "@/middlewares/rbac";

const tags = ["Docker Hub"];

export const pullImageSchema = z.object({
  image: z.string().trim().min(1),
});

const pullImageErrorSchema = z.object({
  message: z.string(),
});

const forgeProjectSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
});

const forgeStackServiceSchema = z.object({
  nodeId: z.string().trim().min(1),
  image: z.string().trim().min(1),
  ports: z.string(),
  environmentVariables: z.string(),
  startCommand: z.string(),
  layout: z.object({ x: z.number(), y: z.number() }).optional(),
});

const forgeProjectLayoutSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const startForgeStackSchema = z.object({
  project: forgeProjectSchema,
  services: z.array(forgeStackServiceSchema).min(1),
  projectLayout: forgeProjectLayoutSchema.optional(),
}).superRefine((input, ctx) => {
  const nodeIds = new Set<string>();
  const ports = new Set<number>();

  for (const [index, service] of input.services.entries()) {
    if (nodeIds.has(service.nodeId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["services", index, "nodeId"],
        message: "Each stack service must have a unique node ID.",
      });
    }
    nodeIds.add(service.nodeId);

    for (const rawPort of service.ports.split(",")) {
      const port = Number(rawPort.trim());
      if (!rawPort.trim() && service.ports.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["services", index, "ports"],
          message: "Ports cannot contain empty values.",
        });
        continue;
      }
      if (!rawPort.trim())
        continue;
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["services", index, "ports"],
          message: "Ports must be comma-separated numbers between 1 and 65535.",
        });
        continue;
      }
      if (ports.has(port)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["services", index, "ports"],
          message: `Port ${port} is already used by another stack service.`,
        });
      }
      ports.add(port);
    }

    for (const environmentVariable of service.environmentVariables.split("\n").map(variable => variable.trim()).filter(Boolean)) {
      if (!/^[A-Z_]\w*=.*/i.test(environmentVariable)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["services", index, "environmentVariables"],
          message: "Environment variables must use KEY=value format, one per line.",
        });
      }
    }
  }
});

export const forgeStackDtoSchema = z.object({
  projects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    layout: forgeProjectLayoutSchema,
    services: z.array(forgeStackServiceSchema.extend({ serviceId: z.string().optional() })),
  })),
});

const startForgeStackResultSchema = z.object({
  nodeId: z.string(),
  serviceId: z.string().optional(),
  status: z.enum(["created", "failed", "updated"]),
  error: z.string().optional(),
});

export const pull = createRoute({
  path: "/hub/pull",
  method: "post",
  description: "Pull a Docker image onto the configured Docker host.",
  request: {
    body: jsonContentRequired(pullImageSchema, "The Docker image to pull."),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(pullImageSchema, "Docker image pulled successfully."),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(pullImageErrorSchema, "The Docker image could not be pulled."),
  },
  middleware: rbacMiddleware,
});

export const startStack = createRoute({
  path: "/hub/stacks/start",
  method: "post",
  description: "Create or reconcile all Docker Swarm services in a Forge stack.",
  request: {
    body: jsonContentRequired(startForgeStackSchema, "The Forge stack to start."),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ results: z.array(startForgeStackResultSchema) }), "Stack start results by Forge node."),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(startForgeStackSchema),
      "The validation error(s)",
    ),
  },
  middleware: rbacMiddleware,
});

export const listStacks = createRoute({
  path: "/hub/stacks",
  method: "get",
  tags,
  responses: { [HttpStatusCodes.OK]: jsonContent(forgeStackDtoSchema, "Persisted Forge stacks.") },
  middleware: rbacMiddleware,
});

export const upsertStackService = createRoute({
  path: "/hub/stacks/services",
  method: "post",
  tags,
  request: { body: jsonContentRequired(z.object({ project: forgeProjectSchema, projectLayout: forgeProjectLayoutSchema, service: forgeStackServiceSchema }), "A Forge service.") },
  responses: { [HttpStatusCodes.OK]: jsonContent(z.object({ nodeId: z.string(), serviceId: z.string(), status: z.enum(["created", "updated"]) }), "Service saved.") },
  middleware: rbacMiddleware,
});

export type PullRoute = typeof pull;
export type StartStackRoute = typeof startStack;
export type ListStacksRoute = typeof listStacks;
export type UpsertStackServiceRoute = typeof upsertStackService;
