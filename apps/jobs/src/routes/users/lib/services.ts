import { db } from "@delivery/drizzle";
import { teamMembers, users } from "@delivery/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getUserInfoById(userId: number) {
  const [result] = await db
    .select({
      user: users,
      role: teamMembers.role,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  const { passwordHash, ...userWithoutPassword } = result.user;

  return {
    ...userWithoutPassword,
    role: result.role!,
  };
}
