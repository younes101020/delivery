import { HTTPException } from "hono/http-exception";
import { basename } from "node:path";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { InsertDeploymentSchema } from "@/db/dto";

import { getGithubAppByAppId, getSystemDomainName } from "@/db/queries/queries";
import { DeploymentError } from "@/lib/error";

export function parseAppHost(appName: string, hostName: string) {
  let url: URL;
  try {
    url = new URL(hostName);
  }
  catch (error) {
    throw new DeploymentError({
      name: "BUILD_APP_ERROR",
      message: "The provided host name is not a valid URL",
      cause: error,
    });
  }
  url.hostname = `${appName}.${url.hostname}`;
  return url.host;
}

export function transformEnvVars(envs: InsertDeploymentSchema["env"]) {
  if (!envs) {
    return undefined;
  }

  const cmdEnvVars = envs
    .trim()
    .split(/\s+/)
    .map(env => `-e ${env}`)
    .join(" ");

  const persistedEnvVars = envs
    .trim()
    .split(/\s+/)
    .map((env) => {
      const [key, value] = env.split("=");
      return {
        key,
        value,
      };
    });

  return {
    cmdEnvVars,
    persistedEnvVars,
  };
}

export function convertGitToAuthenticatedUrl(gitUrl: string, token: string) {
  return gitUrl.replace(
    "git://",
    `https://x-access-token:${token}@`,
  );
}

export async function prepareDataForProcessing(deployment: InsertDeploymentSchema) {
  const githubApp = await getGithubAppByAppId(deployment.githubAppId);
  if (!githubApp?.secret)
    throw new HTTPException(HttpStatusCodes.UNAUTHORIZED, { message: "Github app secret not found" });
  if (!githubApp)
    return null;
  const hostName = await getSystemDomainName();
  if (!hostName)
    return null;
  const repoName = basename(deployment.repoUrl, ".git").toLowerCase();
  const fqdn = parseAppHost(repoName, hostName);
  const environmentVariables = transformEnvVars(deployment.env);
  const port = deployment.staticdeploy ? 80 : deployment.port!;

  return {
    repoName,
    clone: { ...githubApp, repoUrl: deployment.repoUrl, secret: githubApp.secret },
    build: {
      port,
      staticdeploy: deployment.staticdeploy,
      env: environmentVariables && environmentVariables.cmdEnvVars,
      cache: deployment.cache,
      fqdn,
      ...(deployment.staticdeploy && { publishdir: deployment.publishdir }),
    },
    configure: {
      application: { port, githubAppId: githubApp.id },
      environmentVariable: environmentVariables && environmentVariables.persistedEnvVars,
      fqdn,
    },
  };
}
