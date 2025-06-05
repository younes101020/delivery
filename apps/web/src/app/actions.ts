"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getClient, getProtectedClient } from "./_lib/client-http";
import { validatedAction, validatedActionWithUser } from "./_lib/form-middleware";
import { setSession } from "./_lib/session";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { email, password } = data;

  const client = await getClient();
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

const skipDeploySchema = z.object({
  action: z.literal("skip"),
  isOnboarding: z.coerce.boolean(),
});

const fullDeploySchema = z.object({
  action: z.literal("deploy"),
  repoUrl: z.string(),
  githubAppId: z.coerce.number(),
  isOnboarding: z.coerce.boolean(),
  cache: z.coerce.boolean(),
  staticdeploy: z.coerce.boolean(),
  publishdir: z.string().optional(),
  port: z
    .coerce
    .number()
    .optional(),
  env: z.string().optional(),
}).superRefine((input, ctx) => {
  if (!input.port && !input.staticdeploy) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "boolean",
      received: "undefined",
      path: ["port"],
      message: "Must be set when the deployment mode is not static",
    });
  }
  if (input.staticdeploy) {
    if (!input.publishdir) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: "string",
        received: "undefined",
        path: ["publishdir"],
        message: "Must be set when the deployment mode is static",
      });
    }
    else if (!input.publishdir.startsWith("/")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publishdir"],
        message: "Publish directory path must start with a forward slash (/)",
      });
    }
  }
});

const deploySchema = z.union([
  skipDeploySchema,
  fullDeploySchema,
]);

export const deploy = validatedActionWithUser(
  deploySchema,
  async (data, _, prev, user) => {
    const { action, isOnboarding } = data;

    let deploymentResponse;
    const client = await getProtectedClient();
    if (action === "deploy") {
      deploymentResponse = await client.deployments.$post({
        json: data,
      });
      if (deploymentResponse.status !== 202) {
        return { error: "Impossible to start the deployment.", inputs: data };
      }
    }

    if (isOnboarding) {
      const response = await client.serverconfig.$patch({
        json: {
          completedByUserId: user.id.toString(),
          onboardingCompleted: true,
        },
      });
      if (!response.ok) {
        return { error: "Something went wrong, please retry later.", inputs: data };
      }
      (await cookies()).set("skiponboarding", "true", {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    if (action === "deploy") {
      const result = await deploymentResponse!.json();
      redirect(`/dashboard/deployments/${result.queueName}`);
    }

    redirect(`/dashboard/applications`);
  },
);

const retryDeploySchema = z.object({
  repoName: z.string(),
  jobId: z.string().min(1),
});

export const retryDeploy = validatedAction(retryDeploySchema, async (data) => {
  const { jobId, repoName } = data;
  const client = await getProtectedClient();
  const response = await client.deployments.jobs.retry[":jobId"].$post({
    param: {
      jobId,
    },
    json: {
      queueName: repoName,
    },
  });
  if (!response.ok) {
    return { error: "Impossible to retry deployment, please retry later.", inputs: data };
  }
  return { success: "Deployment retry attempted", inputs: data };
});

const domainNameSchema = z.object({
  domainName: z.string().url(),
});

export const domainName = validatedAction(domainNameSchema, async (data) => {
  const client = await getProtectedClient();
  const response = await client.serverconfig.$patch({
    json: {
      domainName: data.domainName,
    },
  });
  if (!response.ok) {
    return { error: "Something went wrong, please retry later.", inputs: data };
  }
  redirect("/onboarding?step=3");
});
