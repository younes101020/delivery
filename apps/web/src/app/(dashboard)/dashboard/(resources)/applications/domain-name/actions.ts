"use server";

import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const applicationDomainSchema = z.object({
  wildcardDomain: z.string().url().optional(),
});

export const applicationDomainForm = validatedAction(applicationDomainSchema, async (data) => {
  const response = await client.serverconfig.$patch({
    json: {
      wildcardDomain: data.wildcardDomain,
    },
  });

  if (response.status !== 200)
    return { error: "Can't update applications domain configuration. Please try again.", inputs: data };

  return { success: "Applications domain configuration updated", inputs: data };
});
