import { client } from "@/lib/http";
import { NextRequest } from "next/server";

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

  const result = await response.json();
  /*const data = await client.githubapps.$post({
    json: {

    }
  })*/

  return Response.redirect(new URL("/?step=3", request.url));
}
