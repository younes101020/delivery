"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const deliveryInstanceFormSchema = z.object({
  fqdn: z.string().url("Should be a valid URL"),
  name: z.string().min(3).max(255),
});

export const deliveryInstanceForm = validatedAction(deliveryInstanceFormSchema, async (data) => {
  const response = await client.serverconfig.instance.$patch({
    json: data,
  });

  if (response.status !== 200)
    return { error: "Can't update delivery instance configuration. Please try again.", inputs: data };

  revalidateTag("delivery-instance-configuration");
  return { success: "Delivery instance configuration updated", inputs: data };
});
