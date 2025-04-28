import { Queue, QueueEvents } from "bullmq";

import { prefix, queueNames } from "@/lib/tasks/const";
import { connection, getBullConnection } from "@/lib/tasks/utils";

export async function getDatabaseQueuesEvents() {
  const bullConnection = getBullConnection(connection);

  const dbQueueEvents = Object.values(queueNames).map(queueName => new QueueEvents(queueName, { connection: bullConnection, prefix: prefix.DATABASE }));

  return dbQueueEvents;
}

export async function getDatabasesActiveJobs() {
  const dbQueues = await getDatabaseQueues();

  const activeJobs = await Promise.all(
    dbQueues.map(async (queue) => {
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

export async function getDatabaseQueues() {
  const bullConnection = getBullConnection(connection);

  return Object.values(queueNames).map((queueName) => {
    return new Queue(queueName, { connection: bullConnection, prefix: prefix.DATABASE });
  });
}
