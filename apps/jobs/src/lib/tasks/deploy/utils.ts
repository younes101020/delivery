import { Queue } from "bullmq";

import type { RedisType } from "../types";

import { getBullConnection } from "../utils";

/**
 * Removes all jobs from a Redis queue, including repeatable jobs, waiting jobs, and delayed jobs.
 * This is useful for cleaning up the queue when redeploying or resetting the system.
 *
 * @param queueName - The name of the queue to clean
 */
export async function removeAllJobsFromRedisHelper(queueName: string) {
  const queue = new Queue(queueName);

  const repeatableJobs = await queue.getJobSchedulers();
  for (const job of repeatableJobs) {
    await queue.removeJobScheduler(job.key);
  }

  await queue.drain(true);
  await queue.clean(0, 50000);
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
