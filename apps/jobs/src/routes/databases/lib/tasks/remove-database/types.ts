import type { Job } from "bullmq";

import type { MergeSubJobs } from "@/lib/tasks/types";

export interface RemoveQueueDatabaseJobData {
  remove: {
    serviceId: string;
  };
}

export type RemoveQueueDatabaseJobName = keyof RemoveQueueDatabaseJobData;

export type RemoveQueueDatabaseJob<T extends RemoveQueueDatabaseJobName> = Omit<Job, "data"> & { data: RemoveQueueDatabaseJobData[T] };

export type RemoveQueueDatabaseJobFns = Record<string, (job: RemoveQueueDatabaseJob<any>) => Promise<unknown>>;

export type AllRemoveQueueDatabaseJobsData = MergeSubJobs<RemoveQueueDatabaseJobData>;
