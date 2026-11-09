"use server";

import { API_KEY_SCOPES } from "@delivery/jobs/types";
import { z } from "zod";

import type { ActionState } from "@/app/_lib/form-middleware";

import { client } from "@/app/_lib/client-http";

const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  scopes: z.array(z.enum(API_KEY_SCOPES)).min(1),
});

export async function createApiKey(_: ActionState, formData: FormData) {
  const inputs = {
    name: String(formData.get("name") ?? ""),
    scopes: formData.getAll("scopes").map(String),
  };
  const result = createApiKeySchema.safeParse(inputs);

  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Invalid API key details.", inputs };

  const http = await client();
  const response = await http["api-keys"].$post({
    json: result.data,
  });

  if (response.status !== 201)
    return { error: "Unable to create API key.", inputs };

  return {
    success: "API key created.",
    inputs,
    createdApiKey: await response.json(),
  };
}

export async function revokeApiKey(_: ActionState, formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id < 1)
    return { error: "Invalid API key.", inputs: { id } };

  const http = await client();
  const response = await http["api-keys"][":id"].$delete({
    param: { id: String(id) },
  });

  if (response.status !== 204)
    return { error: "Unable to revoke API key.", inputs: { id } };

  return {
    success: "API key revoked.",
    inputs: { id },
    revokedId: id,
  };
}
