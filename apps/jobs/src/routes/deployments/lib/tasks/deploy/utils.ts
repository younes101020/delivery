import type { Job as TJob } from "bullmq";

import { Job, Queue, QueueEvents } from "bullmq";
import { HTTPException } from "hono/http-exception";
import { basename } from "node:path";

import type { CurrentJobSchema, DeploymentReferenceAndDataSchema, PreviousJobSchema } from "@/db/dto";

import { DeploymentError } from "@/lib/error";
import { connection, fetchQueueTitles, getBullConnection } from "@/lib/tasks/utils";

import { JOBS } from ".";

export async function getCurrentDeploymentsState() {
  const deployments = await fetchQueueTitles(connection, "application");

  const currentDeploymentsState = await Promise.all(deployments.map(async (deployment) => {
    const queue = new Queue(deployment.queueName, { connection: getBullConnection(connection), prefix: "application" });
    const jobs = await queue.getJobs(["active", "failed"]);

    if (jobs.length < 1)
      return null;

    const latestStep = getLatestJob(jobs)!;

    return {
      id: latestStep.id!,
      stacktrace: latestStep.stacktrace,
      timestamp: new Date(latestStep.timestamp).toDateString(),
      repoName: deployment.queueName,
    };
  }));

  function isNotNull<T extends CurrentJobSchema>(deployState: null | T): deployState is T {
    return deployState != null;
  }

  return currentDeploymentsState.filter(isNotNull);
}

export async function getPreviousDeploymentsState() {
  const deployments = await fetchQueueTitles(connection, "application");

  const previousDeploymentsState = await Promise.all(deployments.map(async (deployment) => {
    const queue = new Queue(deployment.queueName, { connection: getBullConnection(connection), prefix: "application" });
    const jobs = await queue.getJobs(["completed"]);

    if (jobs.length < 1)
      return null;

    const latestStep = getLatestJob(jobs)!;
    const logs = jobs.find(job => job.name === "build").data.logs;
    const applicationId = jobs.find(job => job.name === "configure").returnvalue;

    return {
      id: latestStep.id!,
      timestamp: new Date(latestStep.timestamp).toDateString(),
      repoName: deployment.queueName,
      logs,
      applicationId,
    };
  }));

  function isNotNull<T extends PreviousJobSchema>(deployState: null | T): deployState is T {
    return deployState != null;
  }

  return previousDeploymentsState.filter(isNotNull);
}

export async function getCurrentDeploymentCount() {
  const deployments = await fetchQueueTitles(connection, "application");
  const activeQueues = [];
  let currentActiveDeploymentCount = 0;

  for (const deployment of deployments) {
    const queue = new Queue(deployment.queueName, { connection: getBullConnection(connection), prefix: "application" });
    const jobs = await queue.getJobs(["active"]);
    if (jobs.length > 0) {
      currentActiveDeploymentCount++;
      activeQueues.push(queue);
    }
  }

  return { currentActiveDeploymentCount, activeQueues };
}

export async function getJobs(queue: Queue) {
  const activeAndFailedJobs = await queue.getJobs(["active", "failed"]);
  const failedJobs = await queue.getJobs(["failed"]);

  const haveJobFailed = failedJobs.length > 0;

  const jobs = haveJobFailed ? failedJobs : activeAndFailedJobs;
  const job = haveJobFailed ? getOldestJob(jobs)! : getLatestJob(activeAndFailedJobs)!;

  return job;
}

export async function deleteDeploymentJobs(queueName: string) {
  const queue = new Queue(queueName, { connection: getBullConnection(connection), prefix: "application" });
  const completedJobs = await queue.getJobs(["completed"]);

  for (const job of completedJobs) {
    await job.remove();
  }
}

export async function checkIfOngoingDeploymentExist(queue: Queue) {
  const jobsCounts = await Promise.all([queue.getActiveCount(), queue.getFailedCount()]);
  return jobsCounts.some(jobCount => jobCount > 0);
}

export function waitForDeploymentToComplete(queueName: string, queue: Queue) {
  const queueEvents = new QueueEvents(queueName, { connection: getBullConnection(connection), prefix: "application" });
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

export async function checkIfDeploymentExist(queue: Queue) {
  const jobsCounts = await queue.getCompletedCount();
  return jobsCounts === 3;
}

export function getLatestJob(jobs: TJob[]) {
  const jobOrder = [JOBS.configure, JOBS.build, JOBS.clone];
  for (const jobName of jobOrder) {
    const job = jobs.find(job => job.name === jobName);
    if (job)
      return job;
  }
  return jobs[0];
}

export function getOldestJob(jobs: TJob[]) {
  const jobOrder = [JOBS.clone, JOBS.build, JOBS.configure];
  for (const jobName of jobOrder) {
    const job = jobs.find(job => job.name === jobName);
    if (job)
      return job;
  }
  return jobs[0];
}

export function fromGitUrlToQueueName(repoUrl: string) {
  return basename(repoUrl, ".git").toLowerCase();
}

export function transformEnvVars(envs: DeploymentReferenceAndDataSchema["env"]) {
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

export function convertGitToAuthenticatedUrl(gitUrl: string, token: string) {
  return gitUrl.replace(
    "git://",
    `https://x-access-token:${token}@`,
  );
}
