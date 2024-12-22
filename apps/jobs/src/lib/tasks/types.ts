import type { Job, Queue, Worker } from "bullmq";

import type { SelectedGithubAppSecretSchema, SelectedGithubAppsSchema } from "@/db/dto";

export interface BuildJobData {
  name: string;
}
export interface JobDataMap {
  clone: SelectedGithubAppsSchema & { secret: SelectedGithubAppSecretSchema };
  build: BuildJobData;
}
export type JobName = "clone" | "build";
export type JobFn<T extends JobName> = (job: Job<JobDataMap[T]>) => Promise<any>;
export type Jobs = { [K in JobName]: JobFn<K> };

export type JobWorker = Worker<JobDataMap[JobName], any, JobName>;
export type JobQueue = Queue<JobDataMap[JobName]>;
export type CreateQueueFn = () => JobQueue;
export type CreateWorkerFn = () => JobWorker;

export type CleanupFn = (queue: JobQueue, worker: JobWorker) => Promise<void>;
export type StartTaskFn = (jobsData: JobDataMap) => Promise<{
  stop: () => Promise<void>;
}>;
export type { Job };
