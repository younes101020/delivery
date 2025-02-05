"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { client } from "./_lib/client-http";
import { validatedAction } from "./_lib/form-middleware";
import { setSession } from "./_lib/session";
import { getUser } from "./_lib/user-session";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { email, password } = data;

  const response = await client.auth.register.$post({
    json: {
      email,
      password,
    },
  });

  // Non explicit error message to end-user to prevent from enumeration attack
  if (!response.ok)
    return { error: "Impossible to sign up", inputs: data };
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
  cache: z.coerce.boolean(),
  port: z
    .string()
    .regex(/^\d+(?::\d+)?$/, { message: "The port format is invalid" })
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

const retryDeploySchema = z.object({
  repoName: z.string(),
  jobId: z.string().min(1),
});

export const retryDeploy = validatedAction(retryDeploySchema, async (data) => {
  const { jobId, repoName } = data;
  const response = await client.deployments.jobs.retry[":jobId"].$post({
    param: {
      jobId,
    },
    json: {
      queueName: repoName,
    },
  });
  if (response.status !== 200) {
    return { error: "Impossible to retry deployment, please retry later.", inputs: data };
  }
  return { success: "Deployment retry attempted", inputs: data };
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
