import { client } from "@/lib/http";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const installationId = req.nextUrl.searchParams.get("installation_id");
  const state = req.nextUrl.searchParams.get("state");

  if (!installationId || !state) {
    redirect("/?step=2");
  }

  const stateObj = JSON.parse(decodeURIComponent(state));

  try {
    await client.githubapps[":id"].$patch({
      param: {
        id: stateObj.appId,
      },
      json: {
        installationId: parseInt(installationId),
      },
    });
  } catch (error) {
    redirect("/?step=2");
  }

  redirect("/?state=3");
}
