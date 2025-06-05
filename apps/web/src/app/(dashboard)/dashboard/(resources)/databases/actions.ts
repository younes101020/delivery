"use server";

import { z } from "zod";

import { getProtectedClient } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const updateContainerStatusSchema = z.object({
  serviceId: z.string(),
});

export const stopDatabaseService = validatedAction(updateContainerStatusSchema, async (inputs) => {
  const { serviceId } = inputs;
  const client = await getProtectedClient();
  const response = await client.databases[":id"].stop.$post({
    param: { id: serviceId },
  });

  if (response.status !== 202) {
    return { error: "Unable to stop the container", inputs };
  }

  return { success: "Container stopped", inputs };
});

export const startDatabaseService = validatedAction(updateContainerStatusSchema, async (inputs) => {
  const { serviceId } = inputs;

  const client = await getProtectedClient();
  const response = await client.databases[":id"].start.$post({
    param: { id: serviceId },
  });

  if (response.status !== 202) {
    return { error: "Unable to start the container", inputs };
  }

  return { success: "Container started", inputs };
});

export async function removeDatabaseService(serviceId: string) {
  const client = await getProtectedClient();
  const response = await client.databases[":id"].$delete({
    param: { id: serviceId },
  });

  if (response.status !== 202) {
    return { error: "Unable to delete the container" };
  }

  return { success: "Container deletion request accepted" };
}
