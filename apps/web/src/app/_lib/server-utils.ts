import "server-only";

import { client } from "./client-http";

interface ApproveTeamMemberInvite {
  invitationId?: string;
  invitedUserEmail: string;
}

export async function approveTeamMemberInvite({ invitationId, invitedUserEmail }: ApproveTeamMemberInvite) {
  if (!invitationId || !invitedUserEmail)
    return;
  const response = await client.users.team.invitation[":id"].$patch(
    {
      param: {
        id: invitationId,
      },
      json: {
        invitedUserEmail,
      },
    },
  );

  if (response.status !== 200) {
    return { error: "Failed to approve team member invitation, ask for a new invitation link or retry later." };
  }
}
