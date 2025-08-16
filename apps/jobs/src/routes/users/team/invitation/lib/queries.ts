import { db } from "@delivery/drizzle";
import { invitations, teamMembers } from "@delivery/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import type { SelectUserSchema } from "@/lib/dto/users.dto";

import type { CreateInvitation, invitationStatus } from "./dto";

interface GetTeamInvitationByTeamId {
  status?: typeof invitationStatus[number];
  teamId: number;
}

export async function getTeamInvitationByTeamId({ teamId, status }: GetTeamInvitationByTeamId) {
  return db.query.invitations.findMany({
    where: status
      ? and(
          eq(invitations.teamId, teamId),
          eq(invitations.status, status),
        )
      : eq(invitations.teamId, teamId),
    with: {
      team: true,
    },
  });
}

interface CreateTeamInvitation {
  teamId: number;
  invitation: CreateInvitation;
}

export async function createInvitationIntoTeam({ teamId, invitation }: CreateTeamInvitation) {
  return db.insert(invitations).values({
    ...invitation,
    teamId,
  }).returning();
}

interface ApproveTeamInvitation {
  invitationId: number;
  invitedUser: Omit<SelectUserSchema, "role">;
}

export async function approveTeamMember({ invitationId, invitedUser }: ApproveTeamInvitation) {
  return db.transaction(async (tx) => {
    const invitation = await tx.query.invitations.findFirst({
      where: and(
        eq(invitations.id, invitationId),
        eq(invitations.status, "pending"),
        eq(invitations.email, invitedUser.email),
      ),
    });

    if (!invitation) {
      throw new HTTPException(404, { message: "Invitation not found." });
    }

    const [updatedInvitation] = await tx.update(invitations)
      .set({
        status: "accepted",
      })
      .where(
        eq(invitations.id, invitationId),
      )
      .returning();

    const newTeamMember = {
      teamId: updatedInvitation.teamId,
      userId: invitedUser.id,
      role: updatedInvitation.role,
    };

    await tx.insert(teamMembers).values(newTeamMember).onConflictDoNothing();

    return updatedInvitation;
  });
};
