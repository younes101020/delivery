import { ApplicationError } from "@/lib/error";
import { docker } from "@/lib/remote-docker";

import type { StopQueueApplicationJob } from "../types";

export async function stop(job: StopQueueApplicationJob<"stop">) {
  const { containerId } = job.data;

  const appContainer = docker.getContainer(containerId);
  await appContainer.stop()
    .catch((error) => {
      throw new ApplicationError({
        name: "STOP_APPLICATION_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
