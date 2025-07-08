"use server";

import z from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedActionWithUser } from "@/app/_lib/form-middleware";
import { env } from "@/env";

const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "owner"]),
});

export const inviteTeamMember = validatedActionWithUser(inviteTeamMemberSchema, async (inputs, _, __, user) => {
  const { email, role } = inputs;
  const response = await client.users[":id"].team.$get({
    param: { id: user.id },
  });

  if (response.status !== 200) {
    return { error: "Unable to get your team detail", inputs };
  }

  const userWithTeam = await response.json();

  const teamId = userWithTeam.id.toString();

  const isAlreadyMember = userWithTeam.teamMembers.some(teamMember => teamMember.user.email === email);

  if (isAlreadyMember) {
    return { error: "This user is already member of your team", inputs };
  }

  const inviteResponse = await client.users.team[":id"].invitation.$get({
    param: { id: teamId },
    query: {
      status: "pending",
    },
  });

  if (inviteResponse.status !== 200) {
    return { error: "Unable to get your team invitations", inputs };
  }

  const pendingInvitations = await inviteResponse.json();

  const isAlreadyInvited = pendingInvitations.some(invitation => invitation.email === email);

  if (isAlreadyInvited) {
    return { error: "This user is already invited to your team", inputs };
  }

  const createInvitationResponse = await client.users.team[":id"].invitation.$post({
    param: { id: teamId },
    json: {
      email,
      role,
      invitedBy: user.id,
    },
  });

  if (createInvitationResponse.status !== 200) {
    return { error: "Unable to invite this user to your team", inputs };
  }

  const createdInvitation = await createInvitationResponse.json();

  const inviteId = createdInvitation.id;

  return { success: "Invitation created", inputs: {
    ...inputs,
    inviteUrl: `${env.BASE_URL}?inviteId=${inviteId}`,
  } };
});

const revokeTeamMemberSchema = z.object({
  memberId: z.coerce.number(),
});

export const revokeTeamMember = validatedActionWithUser(revokeTeamMemberSchema, async (inputs, _, __, user) => {
  const { memberId } = inputs;
  const response = await client.users[":id"].team.$get({
    param: { id: user.id.toString() },
  });

  if (response.status !== 200) {
    return { error: "Unable to get your team detail.", inputs };
  }

  const userWithTeam = await response.json();

  const revokeResponse = await client.users.team[":id"].$delete({
    param: {
      id: userWithTeam.id.toString(),
    },
    json: {
      revokedUserId: memberId,
    },
  });

  if (revokeResponse.status !== 204) {
    return { error: "Unable to delete this member.", inputs };
  }

  return { success: "User revoked from your team.", inputs };
});
