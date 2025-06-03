import type { NextRequest } from "next/server";

import { redirect } from "next/navigation";

import { client } from "@/app/_lib/client-http";

import type { GithubAppResponse } from "../types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const isOnboarding = searchParams.get("state");

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  const response = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    return new Response("Failed to convert app manifest", { status: response.status });
  }
  const result = (await response.json()) as GithubAppResponse;

  const appResponse = await client.githubapps.$post({
    json: {
      webhookSecret: result.webhook_secret,
      clientId: result.client_id,
      clientSecret: result.client_secret,
      appId: result.id,
      privateKey: result.pem,
      name: result.name,
    },
  });
  if (appResponse.status !== 200) {
    const fallbackErrorUrl = isOnboarding === "true" ? "/onboarding/?step=3" : "/dashboard";
    redirect(fallbackErrorUrl);
  }
  const app = await appResponse.json();
  const metadata = {
    appId: app.appId,
    isOnboarding: isOnboarding === "true",
  };
  const stateObj = encodeURIComponent(JSON.stringify(metadata));
  return Response.redirect(
    `https://github.com/apps/${result.slug}/installations/new?state=${stateObj}`,
  );
}
