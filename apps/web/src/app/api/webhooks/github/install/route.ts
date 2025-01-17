import type { NextRequest } from "next/server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { client } from "@/lib/http";

export async function GET(req: NextRequest) {
  const installationId = req.nextUrl.searchParams.get("installation_id");
  const state = req.nextUrl.searchParams.get("state");

  if (!installationId || !state) {
    redirect("/onboarding/?step=3");
  }

  const stateObj = JSON.parse(decodeURIComponent(state));

  try {
    await client.githubapps[":id"].$patch({
      param: {
        id: stateObj.appId,
      },
      json: {
        installationId: Number.parseInt(installationId),
      },
    });
  }
  catch (error) {
    console.error(error);
    redirect("/onboarding/?step=3");
  }
  revalidateTag("github-app-installations-creds");
  redirect("/onboarding/?state=4");
}
