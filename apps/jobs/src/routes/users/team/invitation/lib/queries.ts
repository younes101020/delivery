import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { invitations } from "@/db/schema";

import type { invitationStatus } from "./dto";

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
  });
}
