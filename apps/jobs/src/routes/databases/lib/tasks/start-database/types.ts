import type { Job } from "bullmq";

import type { CreateDatabaseSchema } from "@/db/dto";
import type { MergeSubJobs } from "@/lib/tasks/types";

type dbType = CreateDatabaseSchema["type"];

export interface QueueDatabaseJobData {
  start: {
    type: dbType;
  };

}

export type QueueDatabaseJobName = keyof QueueDatabaseJobData;

export type QueueDatabaseJob<T extends QueueDatabaseJobName> = Omit<Job, "data"> & { data: QueueDatabaseJobData[T] };

export type QueueDatabaseJobFns = Record<string, (job: QueueDatabaseJob<any>) => Promise<unknown>>;

export type AllDatabaseJobsData = MergeSubJobs<QueueDatabaseJobData>;
