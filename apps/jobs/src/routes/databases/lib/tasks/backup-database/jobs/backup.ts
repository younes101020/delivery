import { DatabaseError } from "@/lib/error";
import { backupDatabaseService } from "@/routes/databases/lib/remote-docker/backup";

import type { BackupQueueDatabaseJob } from "../types";

export async function backup(job: BackupQueueDatabaseJob) {
  await backupDatabaseService(job.data.serviceName)
    .catch((error) => {
      throw new DatabaseError({
        name: "BACKUP_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error while backing up database",
      });
    });
}
