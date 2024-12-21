import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { applications } from "../schema";

export const selectApplicationsSchema = createSelectSchema(applications);
export const insertApplicationsSchema = createInsertSchema(applications, {
  name: schema => schema.name.min(1).max(500),
})
  .required({
    fqdn: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  });
export const patchApplicationsSchema = insertApplicationsSchema.partial();

export const insertDeploymentSchema = z.object({
  repoUrl: z.string().url(),
  githubAppId: z.number(),
});

export type InsertDeploymentSchema = z.infer<typeof insertDeploymentSchema>;
