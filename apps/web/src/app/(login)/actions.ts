"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getClient } from "@/app/_lib/client-http";
import { validatedAction } from "@/app/_lib/form-middleware";
import { setSession } from "@/app/_lib/session";

export async function signOut() {
  (await cookies()).delete("session");
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  redirectTo: z.string()
    .refine((pathname) => {
      const isValidSuccessSignInPathnameRedirect = pathname === "/dashboard/applications" || pathname.startsWith("/onboarding");
      if (isValidSuccessSignInPathnameRedirect) {
        return true;
      }
    }, {
      message: "Invalid redirect URL",
    }),
});

export const signIn = validatedAction(signInSchema, async (data) => {
  const { email, password, redirectTo } = data;
  const client = getClient();
  const response = await client.auth.verify.$post({
    json: {
      email,
      password,
    },
  });

  if (response.status !== 200) {
    return { error: "Invalid email or password. Please try again.", inputs: data };
  }
  const user = await response.json();
  await setSession(user);
  redirect(redirectTo);
});
