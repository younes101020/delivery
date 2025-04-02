import type { Job } from "bullmq";

import type { MergeSubJobs } from "@/lib/tasks/types";

export interface StartQueueDatabaseJobData {
  start: {
    serviceId: string;
  };
}

export type StartQueueDatabaseJobName = keyof StartQueueDatabaseJobData;

export type StartQueueDatabaseJob<T extends StartQueueDatabaseJobName> = Omit<Job, "data"> & { data: StartQueueDatabaseJobData[T] };

export type StartQueueDatabaseJobFns = Record<string, (job: StartQueueDatabaseJob<any>) => Promise<unknown>>;

export type AllStartQueueDatabaseJobsData = MergeSubJobs<StartQueueDatabaseJobData>;
