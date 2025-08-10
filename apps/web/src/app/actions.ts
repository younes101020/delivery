"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { client } from "./_lib/client-http";
import { validatedAction, validatedActionWithUser } from "./_lib/form-middleware";
import { setSession } from "./_lib/session";
import { getUser } from "./_lib/user-session";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  repeatPassword: z.string().min(8, "Password must be at least 8 characters"),
  inviteId: z.string().optional(),
}).refine(data => data.password === data.repeatPassword, {
  message: "Passwords do not match",
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { email, password, inviteId } = data;

  const http = await client();
  const response = await http.auth.register.$post({
    json: {
      email,
      password,
      invitationId: inviteId ? Number.parseInt(inviteId) : undefined,
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

export const deploy = validatedActionWithUser(
  deploySchema,
  async (data, _, prev, user) => {
    const { isOnboarding } = data;

    const http = await client();
    const deploymentResponse = await http.deployments.$post({
      json: data,
    });
    if (deploymentResponse.status !== 202) {
      return { error: "Impossible to start the deployment.", inputs: data };
    }

    if (isOnboarding) {
      const response = await http.serverconfig.$patch({
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

    const result = await deploymentResponse!.json();
    redirect(`/dashboard/deployments/${result.queueName}`);
  },
);

export async function skipOnboardingDeployment() {
  const user = await getUser();

  if (!user)
    throw new Error("User is not authenticated");

  const http = await client();

  const response = await http.serverconfig.$patch({
    json: {
      completedByUserId: user.id.toString(),
      onboardingCompleted: true,
    },
  });
  if (!response.ok)
    throw new Error("Something went wrong, please retry later.");
  (await cookies()).set("skiponboarding", "true", {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect(`/dashboard/applications`);
}

const retryDeploySchema = z.object({
  repoName: z.string(),
  jobId: z.string().min(1),
});

export const retryDeploy = validatedAction(retryDeploySchema, async (data) => {
  const { jobId, repoName } = data;
  const http = await client();
  const response = await http.deployments.jobs.retry[":jobId"].$post({
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
  const http = await client();
  const response = await http.serverconfig.$patch({
    json: {
      domainName: data.domainName,
    },
  });
  if (!response.ok) {
    return { error: "Something went wrong, please retry later.", inputs: data };
  }
  redirect("/onboarding?step=3");
});

export async function updateDelivery() {
  const http = await client();
  const response = await http.version.$put();
  if (!response.ok) {
    return { error: "Failed to update Delivery version", inputs: {} };
  }
  const data = await response.json();
  console.log("Delivery updated to version", data.version);
  return { success: `Delivery updated to version ${data.version}`, inputs: {} };
}
