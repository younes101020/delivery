import type { Job } from "bullmq";

import type { CreateDatabaseSchema } from "@/db/dto";
import type { MergeSubJobs } from "@/lib/tasks/types";

type dbType = CreateDatabaseSchema["type"];

export interface CreateQueueDatabaseJobData {
  create: {
    type: dbType;
  };
}

export type CreateQueueDatabaseJobName = keyof CreateQueueDatabaseJobData;

export type CreateQueueDatabaseJob<T extends CreateQueueDatabaseJobName> = Omit<Job, "data"> & { data: CreateQueueDatabaseJobData[T] };

export type CreateQueueDatabaseJobFns = Record<string, (job: CreateQueueDatabaseJob<any>) => Promise<unknown>>;

export type AllCreateQueueDatabaseJobsData = MergeSubJobs<CreateQueueDatabaseJobData>;
