import { type Job, Queue } from "bullmq";

import type { RedisType } from "../types";

import { JOBS } from ".";
import { connection, getBullConnection } from "../utils";

export async function getCurrentDeploymentsState() {
  const deployments = await fetchQueueTitles(connection);
  const currentDeploymentsState = [];

  for (const deployment of deployments) {
    const queue = new Queue(deployment.queueName, { connection: getBullConnection(connection) });
    const jobs = (await queue.getJobs(["active", "failed"]) || []) as Job[];

    const latestStep = getLatestJob(jobs)!;

    currentDeploymentsState.push({
      id: latestStep.id!,
      previousStep: latestStep.name === JOBS.clone ? undefined : latestStep.name === JOBS.build ? JOBS.clone : JOBS.build,
      step: latestStep.name,
      nextStep: latestStep.name === JOBS.configure ? undefined : latestStep.name === JOBS.build ? JOBS.configure : JOBS.build,
      stacktrace: latestStep.stacktrace,
      timestamp: new Date(latestStep.timestamp),
      status: await latestStep.getState(),
      repoName: deployment.queueName,
    });
  }

  return currentDeploymentsState;
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
