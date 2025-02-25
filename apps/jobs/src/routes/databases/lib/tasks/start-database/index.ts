import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { getStartDatabaseQueue, queueName } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

export async function startDatabase(containerId: string) {
  await subscribeWorkerTo(queueName, PROCESSOR_FILE);

  const startDbQueue = getStartDatabaseQueue();
  await startDbQueue.add(queueName, { containerId }, { removeOnComplete: true });
}
