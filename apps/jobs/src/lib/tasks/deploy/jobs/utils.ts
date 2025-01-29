import { basename } from "node:path";

import type { InsertDeploymentSchema } from "@/db/dto";

import { getGithubAppByAppId, getSystemDomainName } from "@/db/queries";
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

export function extractPortCmd(portCmd: string) {
  const portMatch = portCmd.match(/-p\s*(\d+:\d+)/);
  if (!portMatch) {
    throw new DeploymentError({
      name: "CONFIGURE_APP_ERROR",
      message: "Invalid port command format",
      cause: "Port command must be in format: -p host:container",
    });
  }
  return portMatch[1];
}

export async function prepareDataForProcessing(deployment: InsertDeploymentSchema) {
  const githubApp = await getGithubAppByAppId(deployment.githubAppId);
  if (!githubApp)
    return null;
  const hostName = await getSystemDomainName();
  if (!hostName)
    return null;
  const repoName = basename(deployment.repoUrl, ".git").toLowerCase();
  const fqdn = parseAppHost(repoName, hostName);
  const environmentVariables = transformEnvVars(deployment.env);

  return {
    clone: { ...githubApp, repoUrl: deployment.repoUrl, repoName },
    // 20min job abort threshold when caching is enabled, otherwise 40min
    timeout: deployment.cache ? 1200000 : 2400000,
    repoName,
    build: {
      port: deployment.port,
      env: environmentVariables && environmentVariables.cmdEnvVars,
      cache: deployment.cache,
      fqdn,
    },
    configure: {
      application: { port: deployment.port, githubAppId: githubApp.id },
      environmentVariable: environmentVariables && environmentVariables.persistedEnvVars,
      fqdn,
    },
  };
}
