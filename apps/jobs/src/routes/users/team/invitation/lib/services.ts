import { db } from "@delivery/drizzle";
import { users } from "@delivery/drizzle/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import { approveTeamMember } from "./queries";

interface ApproveInvitation {
  invitationId: number;
  invitedUserEmail: string;
}

export async function approveInvitation({ invitationId, invitedUserEmail }: ApproveInvitation) {
  const [invitedUser] = await db.select().from(users).where(eq(users.email, invitedUserEmail)).limit(1);

  if (!invitedUser) {
    throw new HTTPException(404, { message: "Invited user not found." });
  }

  return approveTeamMember({
    invitationId,
    invitedUser,
  });
}
