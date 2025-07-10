import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { db } from "@/db";
import { teamMembers, teams } from "@/db/schema";

export async function getTeamForUserByUserId(userId: number) {
  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, userId),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.team || null;
}

interface RevokeUserFromTeam {
  userId: number;
  teamId: number;
}

export async function revokeUserFromTeam({ userId, teamId }: RevokeUserFromTeam) {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);

  if (!team) {
    throw new HTTPException(404, { message: "Team not found" });
  }

  const [revokedTeamMember] = await db.select()
    .from(teamMembers)
    .where(and(
      eq(teamMembers.userId, userId),
      eq(teamMembers.teamId, teamId),
    ))
    .limit(1);

  if (!revokedTeamMember) {
    throw new HTTPException(404, { message: "User not found in the team" });
  }

  await db.delete(teamMembers).where(
    and(
      eq(teamMembers.userId, userId),
      eq(teamMembers.teamId, teamId),
    ),
  );
}
