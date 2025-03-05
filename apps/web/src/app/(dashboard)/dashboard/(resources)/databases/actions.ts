"use server";

import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const injectEnvSchema = z.object({
  containerId: z.string(),
  name: z.string(),
});

export const injectEnv = validatedAction(injectEnvSchema, async (inputs) => {
  const response = await client.deployments.redeploy[":queueName"].$post({
    param: { queueName: inputs.name },
  });

  if (response.status !== 202) {
    return { error: "Unable to inject the environment variable", inputs };
  }

  return { success: "Redeployment success", inputs };
});

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
