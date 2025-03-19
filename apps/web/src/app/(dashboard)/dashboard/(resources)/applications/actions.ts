"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { getFormChangesAction, validatedAction } from "@/app/_lib/form-middleware";

import { transformEnvVars } from "./_lib/utils";

const editApplicationSchema = z
  .object({
    fqdn: z.string(),
    port: z
      .coerce
      .number()
      .optional(),
    environmentVariables: z.string(),
    name: z.string(),
  })
  .partial()
  .required({ name: true });

export const editApplication = validatedAction(
  editApplicationSchema,
  async (data, _, prevState) => {
    const changes = getFormChangesAction(data, prevState);
    const { environmentVariables, ...applicationData } = changes;
    const response = await client.applications[":slug"].$patch({
      param: { slug: changes.name },
      json: {
        applicationData,
        environmentVariable: transformEnvVars(environmentVariables),
      },
    });
    if (response.status !== 200) {
      return {
        error: "Impossible to update your application configuration. Please try again.",
        inputs: data,
      };
    }
    revalidateTag(`application-${data.name}`);
    return { success: "Application updated successfully.", inputs: data };
  },
);

export async function removeApplication(name: string) {
  const response = await client.applications[":slug"].$delete({
    param: { slug: name },
  });
  if (response.status !== 204) {
    return {
      success: false,
    };
  }
  revalidateTag(`application-${name}`);
  return {
    success: true,
  };
}

const updateContainerStatusSchema = z.object({
  containerId: z.string(),
});

export const stopContainer = validatedAction(updateContainerStatusSchema, async (inputs) => {
  const { containerId } = inputs;

  const response = await client.applications[":id"].stop.$post({
    param: { id: containerId },
  });

  if (response.status !== 202) {
    return { error: "Unable to stop the container", inputs };
  }

  return { success: "Container stopped", inputs };
});

export const startContainer = validatedAction(updateContainerStatusSchema, async (inputs) => {
  const { containerId } = inputs;

  const response = await client.applications[":id"].start.$post({
    param: { id: containerId },
  });

  if (response.status !== 202) {
    return { error: "Unable to start the container", inputs };
  }

  return { success: "Container started", inputs };
});

export async function redeploy(applicationName: string) {
  const response = await client.deployments.redeploy[":queueName"].$post({
    param: { queueName: applicationName },
  });
  if (response.status !== 202) {
    return { error: "Unable to redeploy the application" };
  }
  return { success: "Redeployment success" };
}

const injectEnvSchema = z.object({
  dbId: z.string(),
  env: z.string(),
  applicationName: z.string(),
});

export const injectEnv = validatedAction(injectEnvSchema, async (inputs) => {
  const { env, dbId, applicationName } = inputs;

  const envResponse = await client.databases[":id"].link.$post({
    param: { id: dbId },
    json: {
      environmentKey: env,
      applicationName,
    },
  });

  if (envResponse.status !== 200) {
    return { error: "Unable to inject the environment variable", inputs };
  }

  const redeployResponse = await client.deployments.redeploy[":queueName"].$post({
    param: { queueName: applicationName },
  });

  if (redeployResponse.status !== 202) {
    return { error: "Unable to redeploy the application", inputs };
  }

  return { success: "Redeployment success", inputs };
});
