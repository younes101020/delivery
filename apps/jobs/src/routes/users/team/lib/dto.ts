import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";

import { teamMembers } from "@/db/schema";

export const selectUserTeamWithMembersSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  teamMembers: z.array(
    z.object({
      id: z.number(),
      role: z.string(),
      teamId: z.number(),
      userId: z.number(),
      joinedAt: z.date(),
      user: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      }),
    }),
  ),
});

export const revokedUserTeamSchema = z.object({
  revokedUserId: z.number(),
});

export const teamMember = createSelectSchema(teamMembers);

export type TeamMember = z.infer<typeof teamMember>;
