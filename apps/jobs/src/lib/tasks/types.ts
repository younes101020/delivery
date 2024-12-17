import type { Job, Queue, Worker } from "bullmq";

export interface JobData {
  timestamp: number;
}
export interface CloneJobData extends JobData {
  gitUrl: string;
}
export interface BuildJobData extends JobData {
  name: string;
}
export interface JobDataMap {
  clone: CloneJobData;
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
export type StartTaskFn = () => Promise<{
  stop: () => Promise<void>;
}>;
export type { Job };
