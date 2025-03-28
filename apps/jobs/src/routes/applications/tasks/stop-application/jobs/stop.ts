import { stopApplicationService } from "@/routes/applications/lib/remote-docker/service-tasks";

import type { StopQueueApplicationJob } from "../types";

export async function stop(job: StopQueueApplicationJob<"stop">) {
  const { serviceName: applicationName } = job.data;
  await stopApplicationService({ name: [applicationName] });
}
