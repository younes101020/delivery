"use server";

import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const updateContainerStatusSchema = z.object({
  containerId: z.string(),
});

export const stopContainer = validatedAction(updateContainerStatusSchema, async (inputs) => {
  const { containerId } = inputs;

  const response = await client.databases[":id"].stop.$post({
    param: { id: containerId },
  });

  if (response.status !== 202) {
    return { error: "Unable to stop the container", inputs };
  }

  return { success: "Container stopped", inputs };
});

export const startContainer = validatedAction(updateContainerStatusSchema, async (inputs) => {
  const { containerId } = inputs;

  const response = await client.databases[":id"].start.$post({
    param: { id: containerId },
  });

  if (response.status !== 202) {
    return { error: "Unable to start the container", inputs };
  }

  return { success: "Container started", inputs };
});

export async function removeContainer(containerId: string) {
  const response = await client.databases[":id"].$delete({
    param: { id: containerId },
  });

  if (response.status !== 202) {
    return { error: "Unable to delete the container" };
  }

  return { success: "Container deletion request accepted" };
}
