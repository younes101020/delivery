import { Queue } from "bullmq";

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
