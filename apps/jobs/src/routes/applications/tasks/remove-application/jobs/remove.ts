import { removeApplicationServiceByName } from "@/routes/applications/lib/remote-docker/utils";

import type { RemoveQueueApplicationJob } from "../types";

export async function remove(job: RemoveQueueApplicationJob<"remove">) {
  const { serviceName: applicationName } = job.data;
  await removeApplicationServiceByName({ name: [applicationName] });
}
