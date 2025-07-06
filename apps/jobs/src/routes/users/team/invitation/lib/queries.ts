import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { db } from "@/db";
import { invitations } from "@/db/schema";

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
  const invitation = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.id, invitationId),
      eq(invitations.status, "pending"),
      eq(invitations.email, invitedUserEmail),
    ),
  });

  if (!invitation) {
    throw new HTTPException(404, { message: "Invitation not found." });
  }

  const [updatedInvitation] = await db.update(invitations)
    .set({
      status: "accepted",
    })
    .where(
      eq(invitations.id, invitationId),
    )
    .returning();

  return updatedInvitation;
}
