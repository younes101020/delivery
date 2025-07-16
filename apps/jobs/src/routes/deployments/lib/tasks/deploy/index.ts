import { FlowProducer, Queue } from "bullmq";
import { HTTPException } from "hono/http-exception";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { DeploymentReferenceAndDataSchema } from "@/lib/dto";

import serverEnv from "@/env";
import { getApplicationIdByName, getEnvironmentVariablesForApplication, getGithubAppByAppId } from "@/lib/queries/queries";
import { connection, getBullConnection, subscribeWorkerTo } from "@/lib/tasks/utils";
import { fromGitUrlToQueueName, parseAppHost, persistedEnvVarsToCmdEnvVars, transformEnvVars, waitForDeploymentToComplete } from "@/routes/deployments/lib/tasks/deploy/utils";

import type { QueueDeploymentJobData } from "./types";

import { PREFIX } from "../const";

type QueueName = string;

export const JOBS = {
  clone: "clone",
  configure: "configure",
  build: "build",
};

const processorFile = join(dirname(fileURLToPath(import.meta.url)), serverEnv.NODE_ENV === "production" ? "../worker.js" : "../worker.ts");

function runDeployment(
  getDeploymentData: (payload: QueueName | DeploymentReferenceAndDataSchema) => Promise<QueueDeploymentJobData>,
) {
  return async (payload: QueueName | DeploymentReferenceAndDataSchema) => {
    const data = await getDeploymentData(payload);
    const repoName = data.build.repoName;

    subscribeWorkerTo(repoName, PREFIX, processorFile);

    const flowProducer = new FlowProducer({ connection: getBullConnection(connection), prefix: PREFIX });
    await flowProducer.add({
      name: JOBS.configure,
      data: data.configure,
      queueName: repoName,
      children: [
        {
          name: JOBS.build,
          data: data.build,
          queueName: repoName,
          opts: { failParentOnFailure: true },
          children: [
            {
              name: JOBS.clone,
              data: data.clone,
              queueName: repoName,
              opts: { failParentOnFailure: true },
            },
          ],
        },
      ],
    });

    return repoName;
  };
}

export const deployApp = runDeployment(async (payload) => {
  if (typeof payload === "object") {
    const { githubAppId, repoUrl, staticdeploy, env, port: exposedPort, publishdir, cache } = payload;
    const githubApp = await getGithubAppByAppId(githubAppId);

    if (!githubApp)
      throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Github app not found" });

    if (!githubApp?.secret)
      throw new HTTPException(HttpStatusCodes.UNAUTHORIZED, { message: "Invalid github app secret" });

    const repoName = fromGitUrlToQueueName(repoUrl);
    const port = staticdeploy ? 80 : exposedPort!;
    const fqdn = parseAppHost(repoName, `http://${serverEnv.PUBLIC_IP}`);
    const environmentVariables = transformEnvVars(env);

    return {
      clone: { ...githubApp, repoUrl, secret: githubApp.secret, repoName },
      build: {
        port,
        staticdeploy,
        isRedeploy: false,
        env: environmentVariables && environmentVariables.cmdEnvVars,
        cache,
        fqdn,
        repoName,
        ...(staticdeploy && { publishdir }),
      },
      configure: {
        application: { port, githubAppId: githubApp.id, name: repoName },
        environmentVariable: environmentVariables && environmentVariables.persistedEnvVars,
        fqdn,
        repoName,
      },
    };
  }
  throw new HTTPException(HttpStatusCodes.BAD_REQUEST, { message: "Invalid deployment payload" });
});

export const redeployApp = runDeployment(async (queueName) => {
  if (typeof queueName === "string") {
    const queue = new Queue(queueName, { connection: getBullConnection(connection), prefix: PREFIX });

    const activeCount = await queue.getActiveCount();
    const isDeploymentRunning = activeCount > 0;
    if (isDeploymentRunning)
      await waitForDeploymentToComplete(queueName, queue);

    const application = await getApplicationIdByName(queueName);
    const environmentVariables = await getEnvironmentVariablesForApplication(application.id);
    const cmdEnvVars = persistedEnvVarsToCmdEnvVars(environmentVariables);
    const completedJobs = await queue.getJobs("completed");
    const jobMap = new Map(completedJobs.map(j => [j.name, j.data]));
    const overrideNonInitialQueueData = { isCriticalError: undefined, logs: undefined };

    await queue.obliterate();

    return {
      clone: { ...jobMap.get("clone"), ...overrideNonInitialQueueData },
      build: { ...jobMap.get("build"), env: cmdEnvVars, isRedeploy: true, ...overrideNonInitialQueueData },
      configure: { ...jobMap.get("configure"), environmentVariable: environmentVariables, ...overrideNonInitialQueueData },
    };
  }
  throw new HTTPException(HttpStatusCodes.BAD_REQUEST, { message: "Invalid redeployment payload" });
});
