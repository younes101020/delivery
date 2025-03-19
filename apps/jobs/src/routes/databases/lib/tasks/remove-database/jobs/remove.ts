import { DatabaseError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";

import type { RemoveQueueDatabaseJob } from "../types";

export async function remove(job: RemoveQueueDatabaseJob<"remove">) {
  const { containerId } = job.data;

  const docker = await getDocker();
  const dbContainer = docker.getContainer(containerId);

  await dbContainer.remove({ force: true })
    .catch((error) => {
      throw new DatabaseError({
        name: "REMOVE_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
