import { FlowProducer } from "bullmq";

import type { StartTaskFn } from "../types";

import { connection } from "../worker";

export const startDeploy: StartTaskFn = async (jobsData) => {
  const queueName = "deploy";
  const flowProducer = new FlowProducer({ connection });

  const jobs = await flowProducer.add({
    name: "build",
    data: jobsData.build,
    queueName,
    children: [
      {
        name: "clone",
        data: jobsData.clone,
        queueName,
      },
    ],
  });

  return {
    queueName: jobs.job.queueName,
  };
};
