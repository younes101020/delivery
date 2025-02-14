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
    id: z.coerce.number(),
  })
  .partial()
  .required({ id: true });

export const editApplication = validatedAction(
  editApplicationSchema,
  async (data, _, prevState) => {
    const changes = getFormChangesAction(data, prevState);
    const { environmentVariables, ...applicationData } = changes;
    const response = await client.applications[":id"].$patch({
      param: { id: changes.id },
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
    revalidateTag(`application-${data.id}`);
    return { success: "Application updated successfully.", inputs: data };
  },
);

export async function removeApplication(id: string) {
  const response = await client.applications[":id"].$delete({
    param: { id },
  });
  if (response.status !== 204) {
    return {
      success: false,
    };
  }
  revalidateTag(`application-${id}`);
  return {
    success: true,
  };
}
