import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { withDocker } from "@/lib/remote-docker/middleware";

interface PullImageInput {
  image: string;
}

export const pullImage = withDocker<void, PullImageInput>(async (docker, input) => {
  if (!input?.image) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: "Docker image is required.",
    });
  }

  const stream = await docker.pull(input.image).catch((error) => {
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: error instanceof Error ? error.message : "Unexpected error occurred while pulling the Docker image.",
    });
  });

  await new Promise<void>((resolve, reject) => {
    docker.modem.followProgress(stream, (error) => {
      if (error) {
        reject(new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: error.message,
        }));
        return;
      }

      resolve();
    });
  });
});
