import type { Job } from "bullmq";

import type { MergeSubJobs } from "@/lib/tasks/types";

export interface StartQueueApplicationJobData {
  start: {
    containerId: string;
  };
}

export type StartQueueApplicationJobName = keyof StartQueueApplicationJobData;

export type StartQueueApplicationJob<T extends StartQueueApplicationJobName> = Omit<Job, "data"> & { data: StartQueueApplicationJobData[T] };

export type StartQueueApplicationJobFns = Record<string, (job: StartQueueApplicationJob<any>) => Promise<unknown>>;

export type AllStartQueueApplicationJobsData = MergeSubJobs<StartQueueApplicationJobData>;
