import type { Job } from "bullmq";

import type { MergeSubJobs } from "@/lib/tasks/types";

export interface BackupQueueDatabaseJobData {
  backup: {
    serviceName: string;
  };
}

export type BackupQueueDatabaseJob = Omit<Job, "data"> & { data: BackupQueueDatabaseJobData["backup"] };
export type BackupQueueDatabaseJobFns = Record<string, (job: BackupQueueDatabaseJob) => Promise<unknown>>;
export type AllBackupQueueDatabaseJobsData = MergeSubJobs<BackupQueueDatabaseJobData>;
