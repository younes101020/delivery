import { db } from "@delivery/drizzle";
import { apiKeys, teamMembers } from "@delivery/drizzle/schema";
import { and, eq, isNull } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { createHash } from "node:crypto";

import type { ApiKeyScope } from "@/lib/api-key-scopes";

import env from "@/env";
import { API_KEY_SCOPES } from "@/lib/api-key-scopes";

const API_KEY_PREFIX = "dly_";

const API_KEY_RESOURCES = [
  "applications",
  "databases",
  "deployments",
  "envvars",
  "githubapps",
  "serverconfig",
  "version",
] as const;

export interface AuthenticatedApiKey {
  id: number;
  scopes: string[];
}

export function getRequiredApiKeyScope(method: string, path: string): ApiKeyScope | null {
  const resource = API_KEY_RESOURCES.find(value => path === `/${value}` || path.startsWith(`/${value}/`));

  if (!resource)
    return null;

  const action = method === "GET" ? "read" : "write";
  const scope = `${resource}:${action}`;

  return API_KEY_SCOPES.find(apiKeyScope => apiKeyScope === scope) ?? null;
}

export const apiKeyAuthMiddleware = createMiddleware(async (c, next) => {
  if (env.NODE_ENV === "test")
    return next();

  const authorization = c.req.header("Authorization");
  const separator = authorization?.indexOf(" ") ?? -1;
  const token = separator > 0 && authorization?.slice(0, separator).toLowerCase() === "bearer"
    ? authorization.slice(separator + 1).trim()
    : undefined;

  if (token === env.BEARER_TOKEN)
    return next();

  if (!token?.startsWith(API_KEY_PREFIX)) {
    throw new HTTPException(401, { message: "Invalid or missing bearer token." });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [apiKey] = await db
    .select({
      id: apiKeys.id,
      scopes: apiKeys.scopes,
    })
    .from(apiKeys)
    .innerJoin(teamMembers, and(
      eq(teamMembers.userId, apiKeys.createdByUserId),
      eq(teamMembers.teamId, apiKeys.teamId),
    ))
    .where(and(eq(apiKeys.tokenHash, tokenHash), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!apiKey) {
    throw new HTTPException(401, { message: "Invalid or revoked API key." });
  }

  const requiredScope = getRequiredApiKeyScope(c.req.method, c.req.path);
  if (!requiredScope || !apiKey.scopes.includes(requiredScope)) {
    throw new HTTPException(403, { message: "This API key does not have permission to access this resource." });
  }

  c.set("apiKey", {
    id: apiKey.id,
    scopes: apiKey.scopes,
  });

  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, apiKey.id));
  await next();
});
