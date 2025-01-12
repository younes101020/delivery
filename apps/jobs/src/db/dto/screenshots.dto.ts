import { z } from "zod";

export const selectScreenshotSchema = z.object({
  url: z.string().url(),
  applicationId: z.coerce.number(),
});

export const selectUrlScreenshotSchema = z.object({
  imageUrl: z.string().url(),
});
