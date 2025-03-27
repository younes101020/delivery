import { stopApplicationServiceByName } from "@/routes/applications/lib/remote-docker/utils";

import type { StopQueueApplicationJob } from "../types";

export async function stop(job: StopQueueApplicationJob<"stop">) {
  const { serviceName: applicationName } = job.data;
  await stopApplicationServiceByName({ name: [applicationName] });
}
