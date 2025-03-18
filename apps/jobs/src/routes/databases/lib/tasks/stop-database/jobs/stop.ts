import { DatabaseError } from "@/lib/error";
import { docker } from "@/lib/remote-docker";

import type { StopQueueDatabaseJob } from "../types";

export async function stop(job: StopQueueDatabaseJob<"stop">) {
  const { containerId } = job.data;

  const dbContainer = docker.getContainer(containerId);
  await dbContainer.stop({ t: 10 })
    .catch((error) => {
      throw new DatabaseError({
        name: "STOP_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
