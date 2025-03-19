import { DatabaseError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";

import type { StartQueueDatabaseJob } from "../types";

export async function start(job: StartQueueDatabaseJob<"start">) {
  const { containerId } = job.data;

  const docker = await getDocker();
  const dbContainer = docker.getContainer(containerId);

  await dbContainer.start()
    .catch((error) => {
      throw new DatabaseError({
        name: "START_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
