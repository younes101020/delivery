import { basename } from "node:path";

import type { InsertDeploymentSchema } from "@/db/dto";

import { getGithubAppByAppId, getSystemDomainName } from "@/db/queries";

import type { Jobs } from "../../types";

import { build } from "./build";
import { clone } from "./clone";
import { configure } from "./configure";
import { parseAppHost, transformEnvVars } from "./utils";

export const jobs: Jobs = {
  clone,
  build,
  configure,
};

export async function prepareDataForProcessing(deployment: InsertDeploymentSchema) {
  const githubApp = await getGithubAppByAppId(deployment.githubAppId);
  if (!githubApp)
    return null;
  const hostName = await getSystemDomainName();
  if (!hostName)
    return null;
  const repoName = basename(deployment.repoUrl, ".git");
  const fqdn = parseAppHost(repoName, hostName);
  const environmentVariables = transformEnvVars(deployment.env);

  return {
    clone: { ...githubApp, repoUrl: deployment.repoUrl, repoName },
    build: {
      repoName,
      port: deployment.port,
      env: environmentVariables && environmentVariables.cmdEnvVars,
      fqdn,
    },
    configure: {
      application: { port: deployment.port, githubAppId: githubApp.id },
      environmentVariable: environmentVariables && environmentVariables.persistedEnvVars,
      repoName,
      fqdn,
    },
  };
}
