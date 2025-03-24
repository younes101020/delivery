import type { Job as TJob } from "bullmq";

import { Job, Queue, QueueEvents } from "bullmq";
import { HTTPException } from "hono/http-exception";
import { basename } from "node:path";

import type { CurrentJobSchema, DeploymentReferenceAndDataSchema, InsertEnvironmentVariablesSchema, PreviousJobSchema } from "@/db/dto";

import { DeploymentError } from "@/lib/error";
import { connection, fetchQueueTitles, getBullConnection } from "@/lib/tasks/utils";

import type { AllQueueDeploymentJobsData } from "./types";

import { JOBS } from ".";
import { PREFIX } from "../const";

export async function getCurrentDeploymentsState() {
  const deployments = await fetchQueueTitles(connection, PREFIX);

  const currentDeploymentsState = await Promise.all(deployments.map(async (deployment) => {
    const queue = new Queue(deployment.queueName, { connection: getBullConnection(connection), prefix: PREFIX });
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

export function getDeploymentQueue(repoName: string) {
  return new Queue<AllQueueDeploymentJobsData>(repoName, { connection: getBullConnection(connection), prefix: PREFIX });
}

export async function getPreviousDeploymentsState() {
  const deployments = await fetchQueueTitles(connection, PREFIX);

  const previousDeploymentsState = await Promise.all(deployments.map(async (deployment) => {
    const queue = new Queue(deployment.queueName, { connection: getBullConnection(connection), prefix: PREFIX });
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
  const deployments = await fetchQueueTitles(connection, PREFIX);
  const queuesWithCounts = await Promise.all(deployments.map(async (deployment) => {
    const queue = new Queue(deployment.queueName, { connection: getBullConnection(connection), prefix: PREFIX });
    const hasActiveJobs = await queue.getActiveCount() > 0;
    return hasActiveJobs ? queue : null;
  }));

  const activeQueues = queuesWithCounts.filter((queue): queue is Queue => queue !== null);
  const currentActiveDeploymentCount = activeQueues.length;

  return { currentActiveDeploymentCount, activeQueues };
}

export async function getJobs(queue: Queue) {
  const activeAndFailedJobs = await queue.getJobs(["active", "failed"]);
  const failedJobs = await queue.getJobs(["failed"]);

  const haveJobFailed = failedJobs.length > 0;

  const jobs = haveJobFailed ? failedJobs : activeAndFailedJobs;
  const job = haveJobFailed ? getOldestJob(jobs) : getLatestJob(activeAndFailedJobs);

  return job;
}

export async function deleteDeploymentJobs(queueName: string) {
  const queue = new Queue(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
  const completedJobs = await queue.getJobs(["completed"]);
  await Promise.all(completedJobs.map(job => job.remove()));
}

export async function checkIfOngoingDeploymentExist(queue: Queue) {
  const jobsCounts = await Promise.all([queue.getActiveCount(), queue.getFailedCount()]);
  return jobsCounts.some(jobCount => jobCount > 0);
}

export function waitForDeploymentToComplete(queueName: string, queue: Queue) {
  const queueEvents = new QueueEvents(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
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

export function plainEnvVarsToPersistedEnvVars(envs: string) {
  return envs
    .trim()
    .split(/\s+/)
    .map((env) => {
      const [key, value] = env.split("=");
      return { key, value };
    },
    );
}

export function persistedEnvVarsToCmdEnvVars(envs: InsertEnvironmentVariablesSchema[]) {
  return envs
    .map(env => `--env ${env.key}=${env.value}`)
    .join(" ");
}

export function transformEnvVars(envs: DeploymentReferenceAndDataSchema["env"]) {
  if (!envs) {
    return undefined;
  }

  const groupedEnvVars = plainEnvVarsToGroupedEnvVars(envs);

  const persistedEnvVars = plainEnvVarsToPersistedEnvVars(envs);

  return {
    groupedEnvVars,
    persistedEnvVars,
  };
}

export function plainEnvVarsToGroupedEnvVars(envs: string) {
  return envs.split(" ");
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
