import z from "zod";

export const versionSchema = z.object({
  version: z.string(),
  imageDigest: z.string(),
  isLatest: z.boolean(),
});
