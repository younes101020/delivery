import { DatabaseError } from "@/lib/error";
import { stopDatabaseService } from "@/routes/databases/lib/remote-docker/service-tasks";

import type { StopQueueDatabaseJob } from "../types";

export async function stop(job: StopQueueDatabaseJob<"stop">) {
  const { serviceId } = job.data;
  await stopDatabaseService(serviceId)
    .catch((error) => {
      throw new DatabaseError({
        name: "STOP_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
