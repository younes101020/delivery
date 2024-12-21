"use server";

import { validatedAction } from "@/lib/auth/middleware";
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

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;
  console.log(email, password);
  redirect("/dashboard");
});
