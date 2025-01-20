import { FlowProducer } from "bullmq";

import type { JobDataMap } from "../types";

import { createWorker } from "../";
import { connection, getBullConnection } from "../utils";

/**
 * Creates and starts deployment jobs.
 * Returns a queue name reference that can be used to track the deployment state.
 */
export async function startDeploy(jobsData: JobDataMap) {
  const queueName = jobsData.build.repoName;
  await createWorker(queueName);
  const flowProducer = new FlowProducer({ connection: getBullConnection(connection) });

  const jobs = await flowProducer.add({
    name: "configure",
    data: jobsData.configure,
    queueName,
    opts: { removeOnComplete: true },
    children: [
      {
        name: "build",
        data: jobsData.build,
        queueName,
        opts: { removeOnComplete: true },
        children: [
          {
            name: "clone",
            data: jobsData.clone,
            queueName,
            opts: { removeOnComplete: true },
          },
        ],
      },
    ],
  });

  return {
    queueName: jobs.job.queueName,
  };
}
