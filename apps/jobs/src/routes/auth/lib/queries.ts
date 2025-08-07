import { db } from "@delivery/drizzle";
import { teamMembers, teams, users } from "@delivery/drizzle/schema";

import type { AuthRegisterSchema } from "./dto";

export async function setUser(user: Omit<AuthRegisterSchema, "password">, passwordHash: string) {
  const [inserted] = await db
    .insert(users)
    .values({ ...user, passwordHash })
    .returning();
  return inserted;
}

export async function getUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });
}

export async function initTeam({ userId }: { userId: number }) {
  return await db.transaction(async (tx) => {
    const [userExist] = await tx.select().from(users).limit(1);

    if (userExist)
      tx.rollback();

    const [createdTeam] = await tx.insert(teams).values({ name: "My team" }).returning({ id: teams.id });

    await tx.insert(teamMembers).values({
      teamId: createdTeam.id,
      userId,
      role: "owner",
    });
  });
}
