import { Queue } from "bullmq";

import { prefix, queueNames } from "@/lib/tasks/const";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllBackupQueueDatabaseJobsData } from "./types";

export const queueName = queueNames.BACKUP;
export const PREFIX = prefix.DATABASE;
export const BACKUP_SCHEDULER_PREFIX = "database-backup-";

export function getBackupDatabaseQueue() {
  return new Queue<AllBackupQueueDatabaseJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}

export async function scheduleDatabaseBackup(serviceName: string) {
  const queue = getBackupDatabaseQueue();
  await queue.upsertJobScheduler(`${BACKUP_SCHEDULER_PREFIX}${serviceName}`, { pattern: "0 0 2 * * *", tz: "UTC" }, {
    name: queueName,
    data: { serviceName },
  });
}

export async function removeDatabaseBackupSchedule(serviceName: string) {
  const queue = getBackupDatabaseQueue();
  await queue.removeJobScheduler(`${BACKUP_SCHEDULER_PREFIX}${serviceName}`);
}
