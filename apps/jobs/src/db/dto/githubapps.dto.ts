import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { githubApp, githubAppSecret } from "../schema";

export const selectGithubAppsSchema = createSelectSchema(githubApp);
export const insertGithubAppsSchema = createInsertSchema(githubApp);
export const patchGithubAppsSchema = insertGithubAppsSchema.partial();

export const selectGithubAppSecretSchema = createSelectSchema(githubAppSecret);
export const insertGithubAppSecretSchema = createInsertSchema(githubAppSecret);
