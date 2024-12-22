import { FlowProducer } from "bullmq";

import type { JobQueue, JobWorker, StartTaskFn } from "../types";

import { cleanup, createQueue, createWorker } from "../queue";

export const startDeploy: StartTaskFn = async (jobsData) => {
  let queue: JobQueue | undefined;
  let worker: JobWorker | undefined;
  let flowProducer: FlowProducer | undefined;

  try {
    queue = createQueue();
    worker = createWorker();
    flowProducer = new FlowProducer({ connection: { host: "bull_queue" } });

    await flowProducer.add({
      name: "build",
      data: jobsData.build,
      queueName: "deploy",
      children: [
        {
          name: "clone",
          data: jobsData.clone,
          queueName: "deploy",
        },
      ],
    });

    return {
      stop: async () => {
        if (queue && worker) {
          await cleanup(queue, worker);
        }
        if (flowProducer) {
          await flowProducer.close();
        }
      },
    };
  }
  catch (error) {
    if (queue || worker) {
      await cleanup(queue!, worker!);
    }
    if (flowProducer) {
      await flowProducer.close();
    }
    throw error;
  }
};
