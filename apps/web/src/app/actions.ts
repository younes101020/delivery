"use server";

import { setSession } from "@/lib/auth/session";
import { validatedAction } from "@/lib/form-middleware";
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
  if (response.status !== 200) return { error: "Impossible to sign up", inputs: data };
  const createdUser = await response.json();
  await setSession(createdUser);

  redirect("/onboarding?step=2");
});

export async function signOut() {
  (await cookies()).delete("session");
}

const deploySchema = z.object({
  repoUrl: z.string(),
  githubAppId: z.coerce.number(),
  isOnboarding: z.coerce.boolean(),
  port: z
    .string()
    .regex(/^\d+(?::\d+)?$/)
    .transform((port) => {
      const [first, second] = port.split(":");
      return second ? port : `${first}:${first}`;
    }),
  env: z.string().optional(),
});

export const deploy = validatedAction(deploySchema, async (data) => {
  const user = await getUser();
  const deploymentResponse = await client.deployments.$post({
    json: data,
  });
  if (deploymentResponse.status !== 200) {
    return { error: "Impossible to start the deployment.", inputs: data };
  }
  
  if (data.isOnboarding) {
    const response = await client.serverconfig.$patch({
      json: {
        completedByUserId: user?.id.toString(),
        onboardingCompleted: true,
      },
    });
    if (response.status !== 200) {
      return { error: "Something went wrong, please retry later.", inputs: data };
    }
    (await cookies()).set("skiponboarding", "true", {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  const result = await deploymentResponse.json();
  redirect(`/dashboard/deployments/${result.queueName}`);
});

const domainNameSchema = z.object({
  domainName: z.string().url(),
});

export const domainName = validatedAction(domainNameSchema, async (data) => {
  const response = await client.serverconfig.$patch({
    json: {
      domainName: data.domainName,
    },
  });
  if (response.status !== 200) {
    return { error: "Something went wrong, please retry later.", inputs: data };
  }
  redirect("/onboarding?step=3");
});
