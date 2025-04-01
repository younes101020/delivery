"use server";

import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const updateContainerStatusSchema = z.object({
  serviceName: z.string(),
});

export const stopDatabaseService = validatedAction(updateContainerStatusSchema, async (inputs) => {
  const { serviceName } = inputs;

  const response = await client.databases[":name"].stop.$post({
    param: { name: serviceName },
  });

  if (response.status !== 202) {
    return { error: "Unable to stop the container", inputs };
  }

  return { success: "Container stopped", inputs };
});

export const startDatabaseService = validatedAction(updateContainerStatusSchema, async (inputs) => {
  const { serviceName } = inputs;

  const response = await client.databases[":name"].start.$post({
    param: { name: serviceName },
  });

  if (response.status !== 202) {
    return { error: "Unable to start the container", inputs };
  }

  return { success: "Container started", inputs };
});

export async function removeDatabaseService(serviceName: string) {
  const response = await client.databases[":name"].$delete({
    param: { name: serviceName },
  });

  if (response.status !== 202) {
    return { error: "Unable to delete the container" };
  }

  return { success: "Container deletion request accepted" };
}
