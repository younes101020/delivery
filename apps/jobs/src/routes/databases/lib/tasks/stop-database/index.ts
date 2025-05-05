import { Queue } from "bullmq";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import env from "@/env";
import { connection, getBullConnection, subscribeWorkerTo } from "@/lib/tasks/utils";

import type { AllStopQueueDatabaseJobsData } from "./types";

import { PREFIX } from "../const";
import { queueName } from "./utils";

export const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), env.NODE_ENV === "production" ? "../worker.js" : "../worker.ts");

export async function stopDatabase(serviceId: string) {
  subscribeWorkerTo(queueName, PREFIX, PROCESSOR_FILE);

  const stopDbQueue = new Queue<AllStopQueueDatabaseJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
  await stopDbQueue.add(queueName, { serviceId });
}
