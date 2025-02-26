import { Job, Queue, QueueEvents } from "bullmq";

import { connection, fetchQueueTitles, getBullConnection } from "@/lib/tasks/utils";

import type { AllQueueDatabaseJobsData } from "./types";

import { PREFIX, queueNames } from "./const";

export async function getDatabaseQueuesEvents() {
  const bullConnection = getBullConnection(connection);

  const dbQueueEvents = Object.values(queueNames).map(queueName => new QueueEvents(queueName, { connection: bullConnection, prefix: PREFIX }));

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

export async function getDatabaseJobAndQueueNameByJobId(jobId: string) {
  const dbQueues = await getDatabaseQueues();

  const jobsWithQueueName = await Promise.all(
    dbQueues.map(async (queue) => {
      const job = await Job.fromId<AllQueueDatabaseJobsData>(queue, jobId);
      return { queueName: queue.name, job };
    }),
  );

  const job = jobsWithQueueName.find(jwQueue => jwQueue.job !== null) ?? null;

  return job;
}

export async function getDatabaseQueues() {
  const dbQueuesTitle = await fetchQueueTitles(connection, PREFIX);
  const bullConnection = getBullConnection(connection);

  return dbQueuesTitle.map(({ prefix, queueName }) => {
    return new Queue(queueName, { connection: bullConnection, prefix });
  });
}
