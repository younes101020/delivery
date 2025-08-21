import z from "zod";

export const versionSchema = z.object({
  version: z.string(),
  isLatest: z.boolean(),
  isInProgress: z.boolean(),
});

export const updatedVersionSchema = z.object({
  version: z.string(),
});
