import { z } from "@hono/zod-openapi";

import { API_KEY_SCOPES } from "@/lib/api-key-scopes";

export const apiKeyScopeSchema = z.enum(API_KEY_SCOPES);

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  scopes: z.array(apiKeyScopeSchema).min(1).refine(scopes => new Set(scopes).size === scopes.length, "Permissions must be unique."),
});

export const apiKeySchema = z.object({
  id: z.number(),
  name: z.string(),
  tokenPrefix: z.string(),
  scopes: z.array(apiKeyScopeSchema),
  createdAt: z.date(),
  lastUsedAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
});

export const createdApiKeySchema = apiKeySchema.extend({
  token: z.string(),
});

export type CreateApiKey = z.infer<typeof createApiKeySchema>;
