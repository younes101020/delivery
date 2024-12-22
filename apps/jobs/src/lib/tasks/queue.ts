import { Queue, Worker } from "bullmq";

import type { CleanupFn, CreateQueueFn, CreateWorkerFn, Job, JobDataMap, JobName } from "./types";

import { jobs } from "./deploy/jobs";

const connection = { host: "bull_queue" };

export const createQueue: CreateQueueFn = () => {
  return new Queue<JobDataMap[JobName]>("deploy", { connection });
};

export const createWorker: CreateWorkerFn = () => {
  return new Worker<JobDataMap[JobName], any, JobName>(
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
};

export async function addJob<T extends JobName>(queue: Queue, jobName: T, data: JobDataMap[T]) {
  return queue.add(jobName, {
    ...data,
    timestamp: Date.now(),
  });
}

export const cleanup: CleanupFn = async (queue, worker) => {
  await Promise.all([queue.close(), worker.close()]);
};
