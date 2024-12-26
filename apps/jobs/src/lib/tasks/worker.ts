import { Worker } from "bullmq";
import IORedis from "ioredis";

import type { Job, JobDataMap, JobName } from "./types";

import { jobs } from "./deploy/jobs";

export const connection = new IORedis({ maxRetriesPerRequest: null });

export async function createWorker() {
  const worker = new Worker<JobDataMap[JobName], any, JobName>(
    "deploy",
    async <T extends JobName>(job: Job<JobDataMap[T]> & { name: T }) => {
      const processor = jobs[job.name];
      if (!processor) {
        throw new Error(`No processor found for job: ${job.name}`);
      }
      return processor(job);
    },
    {
      connection,
    },
  );
  return worker;
}
