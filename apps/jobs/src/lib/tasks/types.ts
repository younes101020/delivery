import type { Job, JobNode, Queue, Worker } from "bullmq";

import type { SelectedGithubAppSecretSchema, SelectedGithubAppsSchema } from "@/db/dto";

export interface BuildJobData {
  name: string;
}
export interface JobDataMap {
  clone: SelectedGithubAppsSchema & { secret: SelectedGithubAppSecretSchema; repoUrl: string };
  build: BuildJobData;
}
export type JobName = "clone" | "build";
export type JobFn<T extends JobName> = (job: Job<JobDataMap[T]>) => Promise<any>;
export type Jobs = { [K in JobName]: JobFn<K> };

export type JobWorker = Worker<JobDataMap[JobName], any, JobName>;
export type JobQueue = Queue<JobDataMap[JobName]>;

export type CleanupFn = (queue: JobQueue, worker: JobWorker) => Promise<void>;
export interface StartTaskReturn {
  queueName: JobNode["job"]["queueName"];
}
export type StartTaskFn = (jobsData: JobDataMap) => Promise<StartTaskReturn>;
export type { Job };
