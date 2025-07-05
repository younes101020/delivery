"use server";

import z from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedActionWithUser } from "@/app/_lib/form-middleware";

const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "owner"]),
});

export const inviteTeamMember = validatedActionWithUser(inviteTeamMemberSchema, async (inputs, _, user) => {
  const { email,
    // role
  } = inputs;
  const response = await client.users[":id"].team.$get({
    param: { id: user.id },
  });

  if (response.status !== 200) {
    return { error: "Unable to get your team detail", inputs };
  }

  const userWithTeam = await response.json();

  const isAlreadyMember = userWithTeam.teamMembers.some(teamMember => teamMember.user.email === email);

  if (isAlreadyMember) {
    return { error: "This user is already member of your team", inputs };
  }
});
