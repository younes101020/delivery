import { DatabaseError } from "@/lib/error";
import { getSwarmServiceById } from "@/lib/remote-docker/utils";
import { removeDatabaseService } from "@/routes/databases/lib/remote-docker/service-tasks";
import { removeDatabaseBackupSchedule } from "@/routes/databases/lib/tasks/backup-database/utils";

import type { RemoveQueueDatabaseJob } from "../types";

export async function remove(job: RemoveQueueDatabaseJob<"remove">) {
  const { serviceId } = job.data;
  const service = await getSwarmServiceById(serviceId);
  const serviceName = (await service.inspect()).Spec.Name;
  await removeDatabaseService(serviceId)
    .catch((error) => {
      throw new DatabaseError({
        name: "REMOVE_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
  if (serviceName)
    await removeDatabaseBackupSchedule(serviceName);
}
