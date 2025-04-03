import { ApplicationError } from "@/lib/error";
import { stopApplicationService } from "@/routes/applications/lib/remote-docker/service-tasks";

import type { StopQueueApplicationJob } from "../types";

export async function stop(job: StopQueueApplicationJob<"stop">) {
  const { serviceId } = job.data;
  await stopApplicationService(serviceId)
    .catch((error) => {
      throw new ApplicationError({
        name: "STOP_APP_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
