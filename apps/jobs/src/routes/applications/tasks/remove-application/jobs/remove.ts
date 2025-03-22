import { ApplicationError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";

import type { RemoveQueueApplicationJob } from "../types";

export async function remove(job: RemoveQueueApplicationJob<"remove">) {
  const { containerId, image } = job.data;

  const docker = await getDocker();
  const appContainer = docker.getContainer(containerId);
  const appImage = docker.getImage(image);

  await appContainer.remove()
    .catch((error) => {
      throw new ApplicationError({
        name: "REMOVE_APPLICATION_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });

  await appImage.remove({ force: true });
}
