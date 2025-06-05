import { z } from "@hono/zod-openapi";

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
