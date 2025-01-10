"use server";

import { setSession } from "@/lib/auth/session";
import { validatedAction } from "@/lib/form-middleware";
import { client } from "@/lib/http";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function signOut() {
  (await cookies()).delete("session");
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data) => {
  const { email, password: passwordHash } = data;
  const response = await client.auth.$post({
    json: {
      email,
      passwordHash,
    },
  });
  if (response.status !== 200) {
    return { error: "Invalid email or password. Please try again.", inputs: data };
  }
  const user = await response.json();
  await setSession(user);
  redirect("/dashboard");
});
