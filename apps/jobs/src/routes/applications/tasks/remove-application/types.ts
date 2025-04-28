import type { Job } from "bullmq";

import type { MergeSubJobs } from "@/lib/tasks/types";

export interface RemoveQueueApplicationJobData {
  remove: {
    serviceId: string;
  };
}

export type RemoveQueueApplicationJobName = keyof RemoveQueueApplicationJobData;

export type RemoveQueueApplicationJob<T extends RemoveQueueApplicationJobName> = Omit<Job, "data"> & { data: RemoveQueueApplicationJobData[T] };

export type RemoveQueueApplicationJobFns = Record<string, (job: RemoveQueueApplicationJob<any>) => Promise<unknown>>;

export type AllRemoveQueueApplicationJobsData = MergeSubJobs<RemoveQueueApplicationJobData>;
