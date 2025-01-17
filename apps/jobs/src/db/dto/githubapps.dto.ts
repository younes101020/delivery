import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { githubApp, githubAppSecret } from "../schema";

export const selectGithubAppsSchema = createSelectSchema(githubApp);
export const insertGithubAppsSchema = createInsertSchema(githubApp).extend({
  privateKey: z.string(),
});
export const patchGithubAppsSchema = insertGithubAppsSchema.partial();

export const selectGithubAppSecretSchema = createSelectSchema(githubAppSecret);
export const insertGithubAppSecretSchema = createInsertSchema(githubAppSecret);

export type InsertGithubAppsSchema = z.infer<typeof insertGithubAppsSchema>;
export type InsertGithubAppsSecretSchema = z.infer<typeof insertGithubAppSecretSchema>;
export type SelectedGithubAppsSchema = z.infer<typeof selectGithubAppsSchema>;
export type SelectedGithubAppSecretSchema = z.infer<typeof selectGithubAppSecretSchema>;
