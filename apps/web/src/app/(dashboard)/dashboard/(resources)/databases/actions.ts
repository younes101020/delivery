"use server";

import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const injectEnvSchema = z.object({
  containerId: z.string(),
});

export const injectEnv = validatedAction(injectEnvSchema, async (inputs) => {
  // const { containerId } = inputs;

  return { success: "", inputs };
});

const stopContainerSchema = z.object({
  containerId: z.string(),
});

export const stopContainer = validatedAction(stopContainerSchema, async (inputs) => {
  const { containerId } = inputs;

  const response = await client.databases[":id"].stop.$post({
    param: { id: containerId },
  });

  if (response.status !== 204) {
    return { error: "Unable to stop the container", inputs };
  }

  return { success: "Container stopped", inputs };
});
