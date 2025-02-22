import { Job, Queue, QueueEvents } from "bullmq";

import type { Database } from "@/db/dto";

import { connection, fetchQueueTitles, getBullConnection } from "@/lib/tasks/utils";

import type { AllDatabaseJobsData } from "./types";

const PREFIX = "database";

export async function getInStartingDatabases() {
  const inStartingDatabases = await fetchQueueTitles(connection, PREFIX);
  const activeInStartingDatabasesJobs = [];

  for (const inStartingDatabase of inStartingDatabases) {
    const queue = getDatabaseQueue(inStartingDatabase.queueName as Database);
    const jobs = await queue.getJobs(["active"]);
    if (jobs.length > 0) {
      const activeDbJob = jobs[0];

      activeInStartingDatabasesJobs.push({
        id: activeDbJob.id,
        timestamp: activeDbJob.timestamp,
        database: activeDbJob.data.type,
      });
    }
  }

  return activeInStartingDatabasesJobs;
}

export function getDatabaseQueue(queueName: Database) {
  return new Queue<AllDatabaseJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}

export function getDatabaseQueueEvents(queueName: Database) {
  return new QueueEvents(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}

export async function getDatabaseJobByIdFromQueue(jobId: string, queue?: Queue<AllDatabaseJobsData>) {
  if (queue)
    return Job.fromId<AllDatabaseJobsData>(queue, jobId);

  const queueNames: Database[] = ["mysql", "mariadb", "postgresql", "mongodb", "redis", "sqlite"];
  for (const queueName of queueNames) {
    const dbqueue = getDatabaseQueue(queueName);
    const job = await Job.fromId<AllDatabaseJobsData>(dbqueue, jobId);
    if (job)
      return job;
  }
}
