import { type Job, Queue } from "bullmq";

import type { JobSchema } from "@/db/dto";

import type { RedisType } from "../types";

import { JOBS } from ".";
import { connection, getBullConnection } from "../utils";

export async function getCurrentDeploymentsState() {
  const deployments = await fetchQueueTitles(connection);

  const currentDeploymentsState = await Promise.all(deployments.map(async (deployment) => {
    const queue = new Queue(deployment.queueName, { connection: getBullConnection(connection) });
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

  function isNotNull<T extends JobSchema>(deployState: null | T): deployState is T {
    return deployState != null;
  }

  return currentDeploymentsState.filter(isNotNull);
}

export async function getJobs(queue: Queue) {
  const activeAndFailedJobs = await queue.getJobs(["active", "failed"]);
  const failedJobs = await queue.getJobs(["failed"]);

  const haveJobFailed = failedJobs.length > 0;

  const jobs = haveJobFailed ? failedJobs : activeAndFailedJobs;
  const job = haveJobFailed ? getOldestJob(jobs)! : getLatestJob(activeAndFailedJobs)!;

  return job;
}

export async function checkIfOngoingDeploymentExist(queue: Queue) {
  const jobsCounts = await Promise.all([queue.getActiveCount(), queue.getFailedCount()]);
  return jobsCounts.some(jobCount => jobCount > 0);
}

export function getLatestJob(jobs: Job[]) {
  return jobs.some(job => job.name === JOBS.configure)
    ? jobs.find(job => job.name === JOBS.configure)
    : jobs.some(job => job.name === JOBS.build)
      ? jobs.find(job => job.name === JOBS.build)
      : jobs.some(job => job.name === JOBS.clone)
        ? jobs.find(job => job.name === JOBS.clone)
        : jobs[0];
}

export function getOldestJob(jobs: Job[]) {
  return jobs.some(job => job.name === JOBS.clone)
    ? jobs.find(job => job.name === JOBS.clone)
    : jobs.some(job => job.name === JOBS.build)
      ? jobs.find(job => job.name === JOBS.build)
      : jobs.some(job => job.name === JOBS.configure)
        ? jobs.find(job => job.name === JOBS.configure)
        : jobs[0];
}

function normalizePrefixGlob(prefixGlob: string): string {
  let prefixGlobNorm = prefixGlob;
  const sectionsCount = prefixGlobNorm.split(":").length - 1;

  if (sectionsCount > 1) {
    prefixGlobNorm += prefixGlobNorm.endsWith(":") ? "" : ":";
  }
  else if (sectionsCount === 1) {
    prefixGlobNorm += prefixGlobNorm.endsWith(":") ? "*:" : ":";
  }
  else {
    prefixGlobNorm += prefixGlobNorm.trim().length > 0 ? ":*:" : "*:*:";
  }

  prefixGlobNorm += "meta";

  return prefixGlobNorm;
}

export async function fetchQueueTitles(redis: RedisType, prefix: string = "bull") {
  const connection = getBullConnection(redis);
  const keys = await connection.keys(normalizePrefixGlob(prefix));

  return keys.map((key) => {
    const parts = key.split(":");
    return {
      prefix: parts.slice(0, -2).join(":"),
      queueName: parts[parts.length - 2],
    };
  });
}
