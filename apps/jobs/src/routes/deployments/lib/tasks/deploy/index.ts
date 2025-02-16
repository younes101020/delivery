import { FlowProducer, Job, Queue, QueueEvents } from "bullmq";
import { HTTPException } from "hono/http-exception";
import { basename } from "node:path";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { DeploymentReferenceAndDataSchema } from "@/db/dto";

import { getGithubAppByAppId, getSystemDomainName } from "@/db/queries/queries";
import { subscribeWorkerTo } from "@/routes/deployments/lib/tasks";

import type { QueueDeploymentJobData } from "./types";

import { connection, getBullConnection } from "../utils";
import { parseAppHost, transformEnvVars } from "./jobs/utils";

type QueueName = string;

export const JOBS = {
  clone: "clone",
  configure: "configure",
  build: "build",
};

function runDeployment(
  getDeploymentData: (payload: QueueName | DeploymentReferenceAndDataSchema) => Promise<QueueDeploymentJobData>,
) {
  return async (payload: QueueName | DeploymentReferenceAndDataSchema) => {
    const data = await getDeploymentData(payload);

    const queueName = typeof payload === "object" ? basename(payload.repoUrl, ".git").toLowerCase() : payload;

    await subscribeWorkerTo(queueName);

    const flowProducer = new FlowProducer({ connection: getBullConnection(connection) });
    await flowProducer.add({
      name: JOBS.configure,
      data: { ...data.configure, repoName: queueName },
      queueName,
      children: [
        {
          name: JOBS.build,
          data: { ...data.build, repoName: queueName },
          queueName,
          opts: { attempts: 3, failParentOnFailure: true },
          children: [
            {
              name: JOBS.clone,
              data: { ...data.clone, repoName: queueName },
              queueName,
              opts: { attempts: 3, failParentOnFailure: true },
            },
          ],
        },
      ],
    });

    return queueName;
  };
}

export const deployApp = runDeployment(async (payload) => {
  if (typeof payload === "object") {
    const { githubAppId, repoUrl, staticdeploy, env, port: exposedPort, publishdir, cache } = payload;
    const [githubApp, hostName] = await Promise.all([getGithubAppByAppId(githubAppId), getSystemDomainName()]);

    if (!githubApp)
      throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Github app not found" });

    if (!hostName)
      throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: "Domain name of the server not found" });

    if (!githubApp?.secret)
      throw new HTTPException(HttpStatusCodes.UNAUTHORIZED, { message: "Invalid github app secret" });

    const queueName = basename(repoUrl, ".git").toLowerCase();
    const port = staticdeploy ? 80 : exposedPort!;
    const fqdn = parseAppHost(queueName, hostName);
    const environmentVariables = transformEnvVars(env);

    return {
      repoName: queueName,
      clone: { ...githubApp, repoUrl, secret: githubApp.secret },
      build: {
        port,
        staticdeploy,
        env: environmentVariables && environmentVariables.cmdEnvVars,
        cache,
        fqdn,
        ...(staticdeploy && { publishdir }),
      },
      configure: {
        application: { port, githubAppId: githubApp.id },
        environmentVariable: environmentVariables && environmentVariables.persistedEnvVars,
        fqdn,
      },
    };
  }
  throw new HTTPException(HttpStatusCodes.BAD_REQUEST, { message: "Invalid deployment payload" });
});

export const redeployApp = runDeployment(async (queueName) => {
  if (typeof queueName === "string") {
    const queue = new Queue(queueName, { connection: getBullConnection(connection) });

    const activeCount = await queue.getActiveCount();
    const isDeploymentRunning = activeCount > 0;

    if (isDeploymentRunning)
      await waitForDeploymentToComplete(queueName, queue);

    const completedJobs = await queue.getJobs("completed");
    const jobMap = new Map(completedJobs.map(j => [j.name, j.data]));
    const overrideNonInitialQueueData = { isCriticalError: undefined, logs: undefined };

    await queue.obliterate();

    return {
      repoName: queueName,
      clone: { ...jobMap.get("clone"), ...overrideNonInitialQueueData },
      build: { ...jobMap.get("build"), ...overrideNonInitialQueueData },
      configure: { ...jobMap.get("configure"), ...overrideNonInitialQueueData },
    };
  }
  throw new HTTPException(HttpStatusCodes.BAD_REQUEST, { message: "Invalid redeployment payload" });
});

export function waitForDeploymentToComplete(queueName: string, queue: Queue) {
  const queueEvents = new QueueEvents(queueName, { connection: getBullConnection(connection) });
  return new Promise<void>((res, rej) => {
    const timeout = setTimeout(() => {
      queueEvents.removeAllListeners();
      rej(new HTTPException(408, { message: "Deployment timeout exceeded" }));
    }, 15 * 60 * 1000); // 15 minute timeout

    const completedHandler = async ({ jobId }: { jobId: string }) => {
      const jobState = await Job.fromId(queue, jobId);
      const isDeploymentCompleted = jobState?.name === "configure";
      if (isDeploymentCompleted) {
        clearTimeout(timeout);
        queueEvents.removeListener("completed", completedHandler);
        res();
      }
    };

    queueEvents.on("completed", completedHandler);
  });
}
