import { Queue } from "bullmq";

import type { InsertDeploymentSchema } from "@/db/dto/deployments.dto";

import { DeploymentError } from "@/lib/error";

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
