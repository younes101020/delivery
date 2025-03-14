import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { PREFIX } from "../const";
import { getRemoveDatabaseQueue, queueName } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

export async function removeDatabase(containerId: string) {
  subscribeWorkerTo(queueName, PREFIX, PROCESSOR_FILE);

  const rmvDbQueue = getRemoveDatabaseQueue();
  await rmvDbQueue.add(queueName, { containerId });
}
