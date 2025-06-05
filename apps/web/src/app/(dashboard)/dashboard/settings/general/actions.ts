"use server";

import { z } from "zod";

import { getProtectedClient } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const deliveryInstanceFormSchema = z.object({
  fqdn: z.string().url("Should be a valid URL"),
  name: z.string().min(3).max(255),
});

export const deliveryInstanceForm = validatedAction(deliveryInstanceFormSchema, async (data) => {
  const client = await getProtectedClient();
  const response = await client.serverconfig.instance.$patch({
    json: data,
  });

  if (response.status !== 200)
    return { error: "Can't update delivery instance configuration. Please try again.", inputs: data };

  return { success: "Delivery instance configuration updated", inputs: data };
});
