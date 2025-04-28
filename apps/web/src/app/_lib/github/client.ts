import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

// see: https://docs.github.com/en/rest/apps/installations?apiVersion=2022-11-28
export async function getGithubApp({ appId, privateKey, installationId, authType }: { appId: string; privateKey: string | null; installationId: string; authType: "installation" | "app" }) {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId,
    },
  });

  const { token } = (await octokit.auth({
    type: authType,
  })) as { token: string };

  const githubApp = new Octokit({
    auth: token,
  });

  return githubApp.apps;
}
