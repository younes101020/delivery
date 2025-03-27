import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { PREFIX } from "../const";
import { getStartDatabaseQueue, queueName } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

export async function startApplication(serviceName: string) {
  subscribeWorkerTo(queueName, PREFIX, PROCESSOR_FILE);

  const startDbQueue = getStartDatabaseQueue();
  await startDbQueue.add(queueName, { serviceName });
}
