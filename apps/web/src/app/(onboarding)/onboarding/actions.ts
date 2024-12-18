"use server";

import { validatedAction } from "@/lib/auth/middleware";
import { setSession } from "@/lib/auth/session";
import { client } from "@/lib/http";
import { getUser } from "@/lib/users";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async () => {
  // const { email, password } = data;

  // TODO: req to job for signin process, on error return { error: error_message }
  //const foundUser = await fetch();

  //await setSession(foundUser);

  redirect("/dashboard");
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { email, password } = data;

  const response = await client.users.$post({
    json: {
      email,
      passwordHash: password,
    },
  });

  // Non explicit error message to end-user to prevent from enumeration attack
  if (response.status !== 200) return { error: "Impossible to signup" };
  const createdUser = await response.json();
  await setSession(createdUser);

  redirect("/?step=2");
});

export async function signOut() {
  (await cookies()).delete("session");
}

const deploySchema = z.object({
  repoId: z.coerce.number(),
});

export const deploy = validatedAction(deploySchema, async () => {
  //const { repoId } = data;
  const user = await getUser();
  const response = await client.onboarding.$patch({
    json: {
      completedByUserId: user?.id.toString(),
      onboardingCompleted: true,
    },
  });
  if (response.status !== 200) {
    return { error: response.statusText };
  }
  (await cookies()).set("skiponboarding", "true", {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect("/dashboard");
});
