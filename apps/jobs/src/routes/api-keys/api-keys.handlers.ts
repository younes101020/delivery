import { HTTPException } from "hono/http-exception";
import { createHash, randomBytes } from "node:crypto";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateRoute, ListRoute, RevokeRoute } from "./api-keys.routes";

import { apiKeyScopeSchema } from "./lib/dto";
import { getOwnerTeam, insertTeamApiKey, listTeamApiKeys, revokeTeamApiKey } from "./lib/queries";

async function getOwnerContext(sessionUser: { id: number; role: string } | undefined) {
  if (!sessionUser || sessionUser.role !== "owner")
    throw new HTTPException(403, { message: "You do not have permission to manage API keys." });

  const team = await getOwnerTeam(sessionUser.id);
  if (!team)
    throw new HTTPException(403, { message: "You are not an owner of a team." });

  return { userId: sessionUser.id, teamId: team.id };
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { teamId } = await getOwnerContext(c.get("sessionUser"));
  const keys = await listTeamApiKeys(teamId);

  return c.json(keys.map(apiKey => ({
    ...apiKey,
    scopes: apiKeyScopeSchema.array().parse(apiKey.scopes),
  })), HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { teamId, userId } = await getOwnerContext(c.get("sessionUser"));
  const { name, scopes } = c.req.valid("json");
  const token = `dly_${randomBytes(32).toString("base64url")}`;
  const apiKey = await insertTeamApiKey({
    name,
    scopes,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    tokenPrefix: token.slice(0, 12),
    createdByUserId: userId,
    teamId,
  });

  c.header("Cache-Control", "no-store");

  return c.json({
    ...apiKey,
    scopes: apiKeyScopeSchema.array().parse(apiKey.scopes),
    token,
  }, HttpStatusCodes.CREATED);
};

export const revoke: AppRouteHandler<RevokeRoute> = async (c) => {
  const { teamId } = await getOwnerContext(c.get("sessionUser"));
  const { id } = c.req.valid("param");
  const apiKey = await revokeTeamApiKey(id, teamId);

  if (!apiKey)
    return c.body(null, HttpStatusCodes.NOT_FOUND);

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
