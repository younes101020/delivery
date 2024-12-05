import { client } from "@/lib/http";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

interface GithubAppOwner {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  avatar_url: string;
  gravatar_id: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface GithubAppPermissions {
  metadata: string;
  contents: string;
  issues: string;
  single_file: string;
}

interface GithubAppResponse {
  id: number;
  slug: string;
  node_id: string;
  owner: GithubAppOwner;
  name: string;
  description: string;
  external_url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  permissions: GithubAppPermissions;
  events: string[];
  client_id: string;
  client_secret: string;
  webhook_secret: string;
  pem: string;
}

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
    redirect("/?step=2");
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
