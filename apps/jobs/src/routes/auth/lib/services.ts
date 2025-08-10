import { db } from "@delivery/drizzle";
import { teamMembers, teams, users } from "@delivery/drizzle/schema";
import { hashPassword } from "@delivery/utils";
import { count, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { verifyPassword } from "@/lib/auth";
import { approveTeamMember } from "@/routes/users/team/invitation/lib/queries";

import type { AuthRegisterSchema, AuthVerifySchema } from "./dto";

import { isOnboarding } from "./utils";

export async function isValidUser(user: AuthVerifySchema) {
  const [result] = await db
    .select({
      user: users,
      role: teamMembers.role,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.email, user.email))
    .limit(1);

  if (!result)
    return false;

  const isValidPassword = await verifyPassword(user.password, result.user.passwordHash);

  if (!isValidPassword)
    return false;

  let role;

  if (user.invitationId) {
    const updatedInvitation = await approveTeamMember({
      invitationId: user.invitationId,
      invitedUserEmail: user.email,
    });
    role = updatedInvitation.role;
  }
  else {
    role = result.role!;
  }

  return {
    id: result.user.id,
    role,
  };
}

export async function registerUser(user: AuthRegisterSchema) {
  return await db.transaction(async (tx) => {
    const passwordHash = await hashPassword(user.password);
    const { password, ...userWithoutNotRawPassword } = user;

    let role = "member";

    const [inserted] = await tx
      .insert(users)
      .values({ ...userWithoutNotRawPassword, passwordHash })
      .returning();

    if (isOnboarding()) {
      role = "owner";
      const [existingUser] = await db.select({ count: count() }).from(users);

      if (existingUser.count > 0)
        tx.rollback();

      const [createdTeam] = await tx.insert(teams).values({ name: "My team" }).returning({ id: teams.id });

      await tx.insert(teamMembers).values({
        teamId: createdTeam.id,
        userId: inserted.id,
        role,
      });
    }

    if (user.invitationId) {
      const updatedInvitation = await approveTeamMember({
        invitationId: user.invitationId,
        invitedUserEmail: user.email,
      });
      role = updatedInvitation.role;
    }
    else if (role === "member") {
      throw new HTTPException(403, { message: "You must be invited to register" });
    }

    return {
      role,
      id: inserted.id,
    };
  });
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
