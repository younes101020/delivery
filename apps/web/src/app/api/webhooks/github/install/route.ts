import type { NextRequest } from "next/server";

import { redirect } from "next/navigation";

import { setInstallationIdOnGithubApp } from "@/app/_lib/github/queries";
import { env } from "@/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const installationId = req.nextUrl.searchParams.get("installation_id");
  const state = req.nextUrl.searchParams.get("state");

  const stateObj = JSON.parse(decodeURIComponent(state || ""));

  const url = {
    success: stateObj.isOnboarding ? "/onboarding/?step=4" : "/dashboard/applications/new",
    failure: stateObj.isOnboarding ? "/onboarding/?step=3" : "/dashboard/applications/new",
  };

  if (!installationId) {
    redirect(url.failure);
  }

  try {
    await setInstallationIdOnGithubApp({ githubAppId: stateObj.appId, installationId: Number.parseInt(installationId) });
  }
  catch (error) {
    console.error(error);
    redirect(url.failure);
  }

  return Response.redirect(new URL(url.success, env.BASE_URL));
}
