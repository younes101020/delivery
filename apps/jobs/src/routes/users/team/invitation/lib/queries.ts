import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { db } from "@/db";
import { invitations, teamMembers, users } from "@/db/schema";

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
  invitedUserEmail: string;
}

export async function approveInvitation({ invitationId, invitedUserEmail }: ApproveTeamInvitation) {
  return db.transaction(async (tx) => {
    const invitation = await tx.query.invitations.findFirst({
      where: and(
        eq(invitations.id, invitationId),
        eq(invitations.status, "pending"),
        eq(invitations.email, invitedUserEmail),
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

    const [invitedUser] = await tx.select().from(users).where(eq(users.email, invitedUserEmail));

    if (!invitedUser) {
      throw new HTTPException(404, { message: "Invited user not found." });
    }

    const newTeamMember = {
      teamId: updatedInvitation.teamId,
      userId: invitedUser.id,
      role: updatedInvitation.role,
    };

    await tx.insert(teamMembers).values(newTeamMember);

    return updatedInvitation;
  });
};
