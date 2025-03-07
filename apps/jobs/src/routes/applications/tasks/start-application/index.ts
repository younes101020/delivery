import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { prefix } from "@/lib/tasks/const";
import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { getStartDatabaseQueue, queueName } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

export async function startApplication(containerId: string) {
  subscribeWorkerTo(queueName, prefix.APPLICATION, PROCESSOR_FILE);

  const startDbQueue = getStartDatabaseQueue();
  await startDbQueue.add(queueName, { containerId });
}
