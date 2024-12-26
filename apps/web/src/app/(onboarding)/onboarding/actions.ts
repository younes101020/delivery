"use server";

import { validatedAction } from "@/lib/auth/middleware";
import { setSession } from "@/lib/auth/session";
import { client } from "@/lib/http";
import { getUser } from "@/lib/users";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

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
  if (response.status !== 200) return { error: "Impossible to sign up" };
  const createdUser = await response.json();
  await setSession(createdUser);

  redirect("/onboarding?step=2");
});

export async function signOut() {
  (await cookies()).delete("session");
}

const deploySchema = z.object({
  repoUrl: z.string().url(),
  githubAppId: z.coerce.number(),
});

export const deploy = validatedAction(deploySchema, async (data) => {
  const user = await getUser();
  const deploymentResponse = await client.deployments.$post({
    json: data,
  });
  if (deploymentResponse.status !== 200) {
    return { error: "Impossible to start the deployment." };
  }
  const response = await client.onboarding.$patch({
    json: {
      completedByUserId: user?.id.toString(),
      onboardingCompleted: true,
    },
  });
  if (response.status !== 200) {
    return { error: "Something went wrong, please retry later." };
  }
  (await cookies()).set("skiponboarding", "true", {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  const result = await deploymentResponse.json();
  redirect(`/dashboard/deployments/${result.queueName}`);
});
