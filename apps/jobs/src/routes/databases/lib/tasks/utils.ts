import { Job, Queue, QueueEvents } from "bullmq";

import { connection, fetchQueueTitles, getBullConnection } from "@/lib/tasks/utils";

import type { AllQueueDatabaseJobsData } from "./types";

import { PREFIX } from "./const";

export async function getDatabaseQueuesEvents() {
  const dbQueuesTitle = await fetchQueueTitles(connection, PREFIX);
  const bullConnection = getBullConnection(connection);

  const dbQueueEvents = dbQueuesTitle.map(({ prefix, queueName }) => {
    return new QueueEvents(queueName, { connection: bullConnection, prefix });
  });

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

export async function getDatabaseJobByIdFromQueue(jobId: string) {
  const dbQueues = await getDatabaseQueues();

  const jobs = await Promise.all(dbQueues.map(queue => Job.fromId<AllQueueDatabaseJobsData>(queue, jobId)));

  return jobs.find(job => job !== null) ?? null;
}

export async function getDatabaseQueues() {
  const dbQueuesTitle = await fetchQueueTitles(connection, PREFIX);
  const bullConnection = getBullConnection(connection);

  return dbQueuesTitle.map(({ prefix, queueName }) => {
    return new Queue(queueName, { connection: bullConnection, prefix });
  });
}
