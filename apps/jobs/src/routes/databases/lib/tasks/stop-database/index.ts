import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { getStopDatabaseQueue, queueName } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

export async function stopDatabase(containerId: string) {
  const stopDbQueue = getStopDatabaseQueue();
  await stopDbQueue.add(queueName, { containerId });

  await subscribeWorkerTo(queueName, PROCESSOR_FILE);
}
