import { FlowProducer } from "bullmq";

import type { QueueDeploymentJobData } from "./types";

import { subscribeWorkerTo } from "../";
import { connection, getBullConnection } from "../utils";

/**
 * Creates and starts deployment jobs.
 * Returns a queue name reference that can be used to track the deployment state.
 */
export async function startDeploy(jobsData: QueueDeploymentJobData) {
  const queueName = jobsData.repoName;

  await subscribeWorkerTo(queueName);

  const flowProducer = new FlowProducer({ connection: getBullConnection(connection) });

  const jobs = await flowProducer.add({
    name: "configure",
    data: { ...jobsData.configure, repoName: queueName },
    queueName,
    opts: { removeOnComplete: true },
    children: [
      {
        name: "build",
        data: { ...jobsData.build, repoName: queueName },
        queueName,
        opts: { removeOnComplete: true },
        children: [
          {
            name: "clone",
            data: { ...jobsData.clone, repoName: queueName },
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
