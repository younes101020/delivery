import { Job, Queue, QueueEvents } from "bullmq";

import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllCreateQueueDatabaseJobsData } from "./types";

import { PREFIX, queueNames } from "../const";

export const queueName = queueNames.CREATE;

export async function getInCreatingDatabasesJobs() {
  const queue = getCreateDatabaseQueue();
  const activeDbJobs = await queue.getJobs(["active"]);

  return activeDbJobs.map(activeDbJob => ({
    id: activeDbJob.id,
    timestamp: activeDbJob.timestamp,
    database: activeDbJob.data.type,
  }));
}

export function getCreateDatabaseQueue() {
  return new Queue<AllCreateQueueDatabaseJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}

export function getCreateDatabaseQueueEvents() {
  return new QueueEvents(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}

export async function getDatabaseJobByIdFromQueue(jobId: string, queue?: Queue<AllCreateQueueDatabaseJobsData>) {
  if (queue)
    return Job.fromId<AllCreateQueueDatabaseJobsData>(queue, jobId);

  const createDbQueue = getCreateDatabaseQueue();
  const job = await Job.fromId<AllCreateQueueDatabaseJobsData>(createDbQueue, jobId);
  if (job)
    return job;
}
