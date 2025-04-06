import { DatabaseError } from "@/lib/error";
import { startDatabaseService } from "@/routes/databases/lib/remote-docker/service-tasks";

import type { StartQueueDatabaseJob } from "../types";

export async function start(job: StartQueueDatabaseJob<"start">) {
  const { serviceId } = job.data;
  await startDatabaseService(serviceId)
    .catch((error) => {
      throw new DatabaseError({
        name: "START_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
