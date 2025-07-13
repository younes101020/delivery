import { githubApp, githubAppSecret } from "@delivery/drizzle/schema";
import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const selectGithubAppsSchema = createSelectSchema(githubApp);
export const insertGithubAppSchema = createInsertSchema(githubApp).extend({
  privateKey: z.string(),
});
export const patchGithubAppsSchema = insertGithubAppSchema.partial();

export const selectGithubAppSecretSchema = createSelectSchema(githubAppSecret);
export const insertGithubAppSecretSchema = createInsertSchema(githubAppSecret);

export type InsertGithubAppSchema = z.infer<typeof insertGithubAppSchema>;
export type InsertGithubAppsSecretSchema = z.infer<typeof insertGithubAppSecretSchema>;
export type SelectedGithubAppsSchema = z.infer<typeof selectGithubAppsSchema>;
export type SelectedGithubAppSecretSchema = z.infer<typeof selectGithubAppSecretSchema>;
