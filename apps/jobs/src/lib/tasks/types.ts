import type { Job, JobNode, Queue, Worker } from "bullmq";

import type { SelectedGithubAppSecretSchema, SelectedGithubAppsSchema } from "@/db/dto";

export interface JobDataMap {
  clone: SelectedGithubAppsSchema & {
    secret: SelectedGithubAppSecretSchema;
    repoUrl: string;
    repoName: string;
  };
  build: { repoName: string; env?: string; port: string };
}
export interface JobParam<T extends JobName>
  extends Partial<Omit<Job<JobDataMap[T]>, "data" | "updateProgress">> {
  data: JobDataMap[T];
  updateProgress: Job<JobDataMap[T]>["updateProgress"];
}
export type JobName = "clone" | "build";
export type JobFn<T extends JobName> = (job: JobParam<T>) => Promise<unknown>;
export type Jobs = { [K in JobName]: JobFn<K> };

export type JobWorker = Worker<JobDataMap[JobName], any, JobName>;
export type JobQueue = Queue<JobDataMap[JobName]>;

export type CleanupFn = (queue: JobQueue, worker: JobWorker) => Promise<void>;
export interface StartTaskReturn {
  queueName: JobNode["job"]["queueName"];
}
export type { Job };
