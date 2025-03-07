import { Queue } from "bullmq";

import { getApplicationsNames } from "@/db/queries/queries";
import { prefix } from "@/lib/tasks/const";
import { connection, getBullConnection } from "@/lib/tasks/utils";

export async function getApplicationsActiveJobs() {
  const appQueues = await getApplicationQueues();

  const activeJobs = await Promise.all(
    appQueues.map(async (queue) => {
      const jobs = await queue.getJobs(["active"]);
      return jobs.map(job => ({
        jobId: job.id,
        containerId: job.data.containerId,
        timestamp: job.timestamp,
        database: job.data.type,
        queueName: queue.name,
      }));
    }),
  );

  return activeJobs.flat();
}

export async function getApplicationQueues() {
  const bullConnection = getBullConnection(connection);
  const applicationsName = await getApplicationsNames();

  return Object.values(applicationsName).map(({ name }) => {
    return new Queue(name, { connection: bullConnection, prefix: prefix.APPLICATION });
  });
}
