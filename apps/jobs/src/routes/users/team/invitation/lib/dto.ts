import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { invitations } from "@/db/schema";

export const invitationStatus = ["pending", "accepted"] as const;

export const InvitationSearchParam = z.object({
  status: z.enum(invitationStatus).optional(),
});

export const selectInvitationSchema = createSelectSchema(invitations);
export const selectInvitationsSchema = selectInvitationSchema.array();

export const createInvitationsSchema = createInsertSchema(invitations).omit({ teamId: true });

export const approvedInvitationSchema = z.object({
  invitedUserEmail: z.string().email(),
});

export type CreateInvitation = z.infer<typeof createInvitationsSchema>;
export type SelectInvitation = z.infer<typeof selectInvitationSchema>;
