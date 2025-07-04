"use server";

import z from "zod";

import { getProtectedClient } from "@/app/_lib/client-http";
import { validatedActionWithUser } from "@/app/_lib/form-middleware";

const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "owner"]),
});

export const inviteTeamMember = validatedActionWithUser(inviteTeamMemberSchema, async (inputs, _, user) => {
  // const { email, role } = inputs;
  const client = await getProtectedClient();
  const response = await client.users[":id"].team.$get({
    param: { id: user.id },
  });

  if (response.status !== 200) {
    return { error: "Unable to get user team", inputs };
  }
});
