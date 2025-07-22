"use server";

import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const deliveryInstanceFormSchema = z.object({
  fqdn: z.string().url("Should be a valid URL"),
  name: z.string().min(3).max(255),
  serviceId: z.string(),
});

export const deliveryInstanceForm = validatedAction(deliveryInstanceFormSchema, async (data) => {
  const response = await client.serverconfig["web-service"][":id"].$patch({
    param: {
      id: data.serviceId,
    },
    json: {
      fqdn: data.fqdn,
      name: data.name,
    },
  });

  if (response.status !== 200)
    return { error: "Can't update delivery instance configuration. Please try again.", inputs: data };

  return { success: "Delivery instance configuration updated", inputs: data };
});
