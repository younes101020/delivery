import type { Job } from "bullmq";

import type { MergeSubJobs } from "@/lib/tasks/types";

export interface StopQueueApplicationJobData {
  stop: {
    serviceId: string;
  };
}

export type StopQueueApplicationJobName = keyof StopQueueApplicationJobData;

export type StopQueueApplicationJob<T extends StopQueueApplicationJobName> = Omit<Job, "data"> & { data: StopQueueApplicationJobData[T] };

export type StopQueueApplicationJobFns = Record<string, (job: StopQueueApplicationJob<any>) => Promise<unknown>>;

export type AllStopQueueApplicationJobsData = MergeSubJobs<StopQueueApplicationJobData>;
