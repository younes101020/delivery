"use server";

import { z } from "zod";

import { client } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";

const createDatabaseSchema = z.object({
  type: z.union([
    z.literal("mysql"),
    z.literal("mariadb"),
    z.literal("postgres"),
    z.literal("mongo"),
    z.literal("redis"),
  ]),
  version: z.string().optional(),
});

export const createContainer = validatedAction(createDatabaseSchema, async (inputs) => {
  const { type } = inputs;

  const response = await client.databases.$post({
    json: {
      type,
    },
  });

  if (response.status !== 202) {
    return { error: "Unable to create the container", inputs };
  }

  return { success: "Container creation request accepted", inputs };
});
