import { Queue, QueueEvents } from "bullmq";

import { getApplicationsNames } from "@/lib/queries/queries";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import { PREFIX, queueNames } from "./const";

const bullConnection = getBullConnection(connection);
const applicationsName = await getApplicationsNames();

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
  return Object.values(applicationsName).map(({ name }) => {
    return new Queue(name, { connection: bullConnection, prefix: PREFIX });
  });
}

export async function getApplicationQueuesEvents() {
  const appQueueEvents = Object.values(queueNames).map(queueName => new QueueEvents(queueName, { connection: bullConnection, prefix: PREFIX }));

  return appQueueEvents;
}
