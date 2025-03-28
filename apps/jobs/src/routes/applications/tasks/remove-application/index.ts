import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { PREFIX } from "../const";
import { getRemoveDatabaseQueue, queueName } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

export async function removeApplicationResource(serviceName: string) {
  subscribeWorkerTo(queueName, PREFIX, PROCESSOR_FILE);

  const removeDbQueue = getRemoveDatabaseQueue();
  await removeDbQueue.add(queueName, { serviceName });
}
