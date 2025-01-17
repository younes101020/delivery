import type { NextRequest } from "next/server";

import { redirect } from "next/navigation";

import { client } from "@/lib/http";

import type { GithubAppResponse } from "../types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

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
    },
  });
  if (appResponse.status !== 200) {
    redirect("/onboarding/?step=3");
  }
  const app = await appResponse.json();
  const metadata = {
    appId: app.appId,
  };
  const stateObj = encodeURIComponent(JSON.stringify(metadata));
  return Response.redirect(
    `https://github.com/apps/${result.slug}/installations/new?state=${stateObj}`,
  );
}
