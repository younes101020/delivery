import { ApplicationError } from "@/lib/error";
import { docker } from "@/lib/remote-docker";

import type { StartQueueApplicationJob } from "../types";

export async function start(job: StartQueueApplicationJob<"start">) {
  const { containerId } = job.data;

  const dbContainer = docker.getContainer(containerId);

  await dbContainer.start()
    .catch((error) => {
      throw new ApplicationError({
        name: "START_APPLICATION_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
