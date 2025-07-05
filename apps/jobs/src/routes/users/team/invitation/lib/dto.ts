import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { invitations } from "@/db/schema";

export const invitationStatus = ["pending", "accepted"] as const;

export const InvitationSearchParam = z.object({
  status: z.enum(invitationStatus).optional(),
});

export const selectInvitationsSchema = createSelectSchema(invitations).array();
