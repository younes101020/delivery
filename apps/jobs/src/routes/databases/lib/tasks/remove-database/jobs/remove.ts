import { DatabaseError } from "@/lib/error";
import { removeDatabaseService } from "@/routes/databases/lib/remote-docker/service-tasks";

import type { RemoveQueueDatabaseJob } from "../types";

export async function remove(job: RemoveQueueDatabaseJob<"remove">) {
  const { serviceName } = job.data;
  await removeDatabaseService({ name: [serviceName] })
    .catch((error) => {
      throw new DatabaseError({
        name: "REMOVE_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
