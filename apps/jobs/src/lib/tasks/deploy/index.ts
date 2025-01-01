import { FlowProducer } from "bullmq";

import type { JobDataMap } from "../types";

import { connection, createWorker } from "../worker";

export async function startDeploy(jobsData: JobDataMap) {
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
