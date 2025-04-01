import { ApplicationError } from "@/lib/error";
import { removeApplicationService } from "@/routes/applications/lib/remote-docker/service-tasks";

import type { RemoveQueueApplicationJob } from "../types";

export async function remove(job: RemoveQueueApplicationJob<"remove">) {
  const { serviceName: applicationName } = job.data;
  await removeApplicationService({ name: [applicationName] })
    .catch((error) => {
      throw new ApplicationError({
        name: "REMOVE_APP_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
