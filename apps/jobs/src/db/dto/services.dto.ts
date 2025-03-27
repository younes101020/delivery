import { z } from "@hono/zod-openapi";

export const servicesDto = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  isProcessing: z.boolean(),
});

export type ServicesDto = z.infer<typeof servicesDto>;
