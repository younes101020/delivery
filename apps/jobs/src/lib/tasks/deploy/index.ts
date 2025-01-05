import { FlowProducer } from "bullmq";

import type { JobDataMap } from "../types";

import { connection, createWorker } from "../worker";

/**
 * Creates and starts deployment jobs.
 * Returns a queue name reference that can be used to track the deployment state.
 */
export async function startDeploy(jobsData: JobDataMap) {
  await createWorker(jobsData.build.repoName);
  const flowProducer = new FlowProducer({ connection });

  const jobs = await flowProducer.add({
    name: "configure",
    data: jobsData.configure,
    queueName: jobsData.build.repoName,
    opts: { removeOnComplete: true, removeOnFail: true },
    children: [
      {
        name: "build",
        data: jobsData.build,
        queueName: jobsData.build.repoName,
        opts: { removeOnComplete: true, removeOnFail: true },
        children: [
          {
            name: "clone",
            data: jobsData.clone,
            queueName: jobsData.clone.repoName,
            opts: { removeOnComplete: true, failParentOnFailure: true, removeOnFail: true },
          },
        ],
      },
    ],
  });

  return {
    queueName: jobs.job.queueName,
  };
}
