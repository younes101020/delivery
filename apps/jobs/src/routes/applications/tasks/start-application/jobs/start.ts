import { ApplicationError } from "@/lib/error";
import { startApplicationService } from "@/routes/applications/lib/remote-docker/service-tasks";

import type { StartQueueApplicationJob } from "../types";

export async function start(job: StartQueueApplicationJob<"start">) {
  const { serviceName: applicationName } = job.data;
  await startApplicationService({ name: [applicationName] })
    .catch((error) => {
      throw new ApplicationError({
        name: "START_APP_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
