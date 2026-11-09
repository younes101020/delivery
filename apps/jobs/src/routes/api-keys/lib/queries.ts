import { db } from "@delivery/drizzle";
import { apiKeys, teamMembers, teams } from "@delivery/drizzle/schema";
import { and, desc, eq, isNull } from "drizzle-orm";

import type { CreateApiKey } from "./dto";

export async function getOwnerTeam(userId: number) {
  const [team] = await db
    .select({ id: teams.id })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.role, "owner")))
    .limit(1);

  return team;
}

export async function listTeamApiKeys(teamId: number) {
  return await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      tokenPrefix: apiKeys.tokenPrefix,
      scopes: apiKeys.scopes,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.teamId, teamId))
    .orderBy(desc(apiKeys.createdAt));
}

export async function insertTeamApiKey({
  name,
  tokenHash,
  tokenPrefix,
  scopes,
  createdByUserId,
  teamId,
}: CreateApiKey & { tokenHash: string; tokenPrefix: string; createdByUserId: number; teamId: number }) {
  const [apiKey] = await db
    .insert(apiKeys)
    .values({ name, tokenHash, tokenPrefix, scopes, createdByUserId, teamId })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      tokenPrefix: apiKeys.tokenPrefix,
      scopes: apiKeys.scopes,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
    });

  return apiKey;
}

export async function revokeTeamApiKey(id: number, teamId: number) {
  const [apiKey] = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.teamId, teamId), isNull(apiKeys.revokedAt)))
    .returning({ id: apiKeys.id });

  return apiKey;
}
