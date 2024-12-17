import type { JobQueue, JobWorker, StartTaskFn } from "../types";

import { addJob, cleanup, createQueue, createWorker } from "../queue";

export const startDeploy: StartTaskFn = async () => {
  let queue: JobQueue | undefined;
  let worker: JobWorker | undefined;

  try {
    queue = createQueue();
    worker = createWorker();

    await addJob(queue, "clone", {
      gitUrl: "user@example.com",
    });

    await addJob(queue, "build", {
      name: "idk",
    });

    return {
      stop: async () => {
        if (queue && worker) {
          await cleanup(queue, worker);
        }
      },
    };
  }
  catch (error) {
    if (queue || worker) {
      await cleanup(queue!, worker!);
    }
    throw error;
  }
};
