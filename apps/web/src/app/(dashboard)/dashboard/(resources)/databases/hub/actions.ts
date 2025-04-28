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
  name: z.string().refine(s => !s.includes(" "), "No Spaces for the name"),
});

export const createContainer = validatedAction(createDatabaseSchema, async (inputs) => {
  const { type, name } = inputs;

  const response = await client.databases.$post({
    json: {
      type,
      name,
    },
  });

  if (response.status !== 202) {
    return { error: "Unable to create the container", inputs };
  }

  return { success: "Container creation request accepted", inputs };
});
