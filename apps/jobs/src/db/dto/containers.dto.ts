import { z } from "@hono/zod-openapi";

export const containersDto = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().optional(),
  state: z.union([
    z.literal("created"),
    z.literal("restarting"),
    z.literal("running"),
    z.literal("remove"),
    z.literal("paused"),
    z.literal("stop"),
    z.literal("dead"),
  ]),
  createdAt: z.number(),
  isProcessing: z.boolean(),
});

export type ContainersDto = z.infer<typeof containersDto>;
