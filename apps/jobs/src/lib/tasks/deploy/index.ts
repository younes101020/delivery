import { FlowProducer } from "bullmq";

import type { StartTaskFn } from "../types";

import { connection, createWorker } from "../worker";

export const startDeploy: StartTaskFn = async (jobsData) => {
  await createWorker(jobsData.build.repoName);
  const flowProducer = new FlowProducer({ connection });

  const jobs = await flowProducer.add({
    name: "build",
    data: jobsData.build,
    queueName: jobsData.build.repoName,
    children: [
      {
        name: "clone",
        data: jobsData.clone,
        queueName: jobsData.clone.repoName,
      },
    ],
  });

  return {
    queueName: jobs.job.queueName,
  };
};
