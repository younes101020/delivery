import type { Job } from "bullmq";

import type { MergeSubJobs } from "@/lib/tasks/types";

export interface StopQueueDatabaseJobData {
  stop: {
    serviceName: string;
  };
}

export type StopQueueDatabaseJobName = keyof StopQueueDatabaseJobData;

export type StopQueueDatabaseJob<T extends StopQueueDatabaseJobName> = Omit<Job, "data"> & { data: StopQueueDatabaseJobData[T] };

export type StopQueueDatabaseJobFns = Record<string, (job: StopQueueDatabaseJob<any>) => Promise<unknown>>;

export type AllStopQueueDatabaseJobsData = MergeSubJobs<StopQueueDatabaseJobData>;
