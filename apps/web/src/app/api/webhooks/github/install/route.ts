import type { NextRequest } from "next/server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { setInstallationIdOnGithubApp } from "@/app/_lib/github/queries";

export async function GET(req: NextRequest) {
  const installationId = req.nextUrl.searchParams.get("installation_id");
  const state = req.nextUrl.searchParams.get("state");

  if (!installationId || !state) {
    redirect("/onboarding/?step=3");
  }

  const stateObj = JSON.parse(decodeURIComponent(state));

  try {
    await setInstallationIdOnGithubApp({ githubAppId: stateObj.appId, installationId: Number.parseInt(installationId) });
  }
  catch (error) {
    console.error(error);
    redirect("/onboarding/?step=3");
  }
  revalidateTag("github-app-installations-creds");
  redirect("/onboarding/?step=4");
}
