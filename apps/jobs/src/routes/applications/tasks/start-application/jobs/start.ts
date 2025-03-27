import { startApplicationServiceByName } from "@/routes/applications/lib/remote-docker/utils";

import type { StartQueueApplicationJob } from "../types";

export async function start(job: StartQueueApplicationJob<"start">) {
  const { serviceName: applicationName } = job.data;
  await startApplicationServiceByName({ name: [applicationName] });
}
