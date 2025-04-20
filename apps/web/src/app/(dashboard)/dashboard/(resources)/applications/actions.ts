"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { getFormChangesAction, validatedAction } from "@/app/_lib/form-middleware";

import { plainEnvVarsToStructured } from "./_lib/utils";

const editApplicationSchema = z
  .object({
    fqdn: z.string(),
    port: z
      .coerce
      .number()
      .optional(),
    environmentVariables: z.string().refine(
      (value) => {
        if (!value)
          return true;
        return value.split(" ").every(env => /^[^=]+=.+$/.test(env.trim()));
      },
      {
        message: "Environment variables must be in format KEY=VALUE and separated by spaces",
      },
    ),
    name: z.string(),
  })
  .partial()
  .required({ name: true });

export const editApplication = validatedAction(
  editApplicationSchema,
  async (data, _, prevState) => {
    const { name } = data;
    const changes = getFormChangesAction(data, prevState);
    const { environmentVariables, ...applicationData } = changes;
    const environmentVariable = environmentVariables ? plainEnvVarsToStructured(environmentVariables) : typeof environmentVariables === "string" ? [] : undefined;

    const response = await client.applications[":name"].$patch({
      param: { name },
      json: {
        applicationData,
        environmentVariable,
      },
    });
    if (response.status !== 200) {
      return {
        error: "Impossible to update your application configuration. Please try again.",
        inputs: data,
      };
    }
    revalidateTag(`application-${name}`);
    return { success: "Application updated successfully.", inputs: data };
  },
);

export async function removeApplication(name: string, redirectToList: boolean) {
  const response = await client.applications[":name"].$delete({
    param: { name },
  });
  if (response.status !== 204) {
    return {
      success: false,
    };
  }
  revalidateTag(`application-${name}`);
  if (redirectToList)
    redirect("/dashboard/applications");
  return {
    success: true,
  };
}

const updateApplicationStateSchema = z.object({
  serviceId: z.string(),
});

export const stopApplication = validatedAction(updateApplicationStateSchema, async (inputs) => {
  const { serviceId } = inputs;

  const response = await client.applications[":id"].stop.$post({
    param: { id: serviceId },
  });

  if (response.status !== 202) {
    return { error: "Unable to stop the service", inputs };
  }

  return { success: "Service stopped", inputs };
});

export const startApplication = validatedAction(updateApplicationStateSchema, async (inputs) => {
  const { serviceId } = inputs;

  const response = await client.applications[":id"].start.$post({
    param: { id: serviceId },
  });

  if (response.status !== 202) {
    return { error: "Unable to start the service", inputs };
  }

  return { success: "Service started", inputs };
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
  dbId: z.string().min(1, "Please select a database"),
  env: z.string().min(1, "Please choose an environment variable key"),
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

  return { success: "Environment variable successfully injected", inputs };
});
