import { db } from "@delivery/drizzle";
import { apiKeys, teamMembers, teams, users } from "@delivery/drizzle/schema";
import { eq } from "drizzle-orm";
import { testClient } from "hono/testing";
import { createHash, randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import createApp from "@/lib/create-app";

import router from "../api-keys.index";

let ownerUserId: number | undefined;
let ownerTeamId: number | undefined;

beforeEach(async () => {
  const [user] = await db
    .insert(users)
    .values({
      email: `api-key-${randomUUID()}@example.test`,
      passwordHash: "test-password-hash",
    })
    .returning({ id: users.id });
  if (!user)
    throw new Error("Unable to create the API key test user.");
  ownerUserId = user.id;

  const [team] = await db
    .insert(teams)
    .values({ name: `API key test ${randomUUID()}` })
    .returning({ id: teams.id });
  if (!team)
    throw new Error("Unable to create the API key test team.");

  ownerTeamId = team.id;
  await db.insert(teamMembers).values({
    userId: user.id,
    teamId: team.id,
    role: "owner",
  });
});

afterEach(async () => {
  if (ownerTeamId) {
    await db.delete(apiKeys).where(eq(apiKeys.teamId, ownerTeamId));
    await db.delete(teamMembers).where(eq(teamMembers.teamId, ownerTeamId));
    await db.delete(teams).where(eq(teams.id, ownerTeamId));
    ownerTeamId = undefined;
  }
  if (ownerUserId) {
    await db.delete(users).where(eq(users.id, ownerUserId));
    ownerUserId = undefined;
  }
});

describe("aPI key management", () => {
  it("creates hashed team keys, lists metadata only, and revokes keys for owners", async () => {
    if (!ownerUserId || !ownerTeamId)
      throw new Error("The API key test team was not initialized.");

    const ownerClient = createApiKeyClient(ownerUserId, "owner");
    const name = `test-api-key-${randomUUID()}`;
    const createResponse = await ownerClient["api-keys"].$post({
      json: {
        name,
        scopes: ["applications:read"],
      },
    });

    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    if (!("token" in created))
      throw new Error("The API key response did not contain the one-time token.");

    const [stored] = await db.select().from(apiKeys).where(eq(apiKeys.id, created.id)).limit(1);
    if (!stored)
      throw new Error("The newly created API key was not persisted.");

    expect(stored.tokenHash).toBe(createHash("sha256").update(created.token).digest("hex"));
    expect(stored.tokenHash).not.toBe(created.token);
    expect(stored.teamId).toBe(ownerTeamId);
    expect(stored.createdByUserId).toBe(ownerUserId);

    const listResponse = await ownerClient["api-keys"].$get();
    expect(listResponse.status).toBe(200);
    const listed = await listResponse.json();
    expect(listed.find(apiKey => apiKey.id === created.id)).toMatchObject({
      name,
      scopes: ["applications:read"],
      tokenPrefix: created.tokenPrefix,
    });
    expect(listed.find(apiKey => apiKey.id === created.id)).not.toHaveProperty("token");

    const memberResponse = await createApiKeyClient(ownerUserId, "member")["api-keys"].$get();
    expect(memberResponse.status).toBe(403);

    const revokeResponse = await ownerClient["api-keys"][":id"].$delete({
      param: { id: String(created.id) },
    });
    expect(revokeResponse.status).toBe(204);

    const [revoked] = await db.select().from(apiKeys).where(eq(apiKeys.id, created.id)).limit(1);
    if (!revoked)
      throw new Error("The revoked API key was not persisted.");
    expect(revoked.revokedAt).toBeInstanceOf(Date);
  });
});

function createApiKeyClient(userId: number, role: string) {
  const app = createApp();
  app.use("*", async (c, next) => {
    c.set("sessionUser", { id: userId, role });
    await next();
  });
  return testClient(app.route("/", router));
}
