import { Queue } from "bullmq";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { connection, getBullConnection, subscribeWorkerTo } from "@/lib/tasks/utils";

import type { AllStopQueueApplicationJobsData } from "./types";

import { PREFIX } from "../const";
import { queueName } from "./utils";

export const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

export async function stopApplication(serviceId: string) {
  subscribeWorkerTo(queueName, PREFIX, PROCESSOR_FILE);

  const stopDbQueue = new Queue<AllStopQueueApplicationJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
  await stopDbQueue.add(queueName, { serviceId });
}
