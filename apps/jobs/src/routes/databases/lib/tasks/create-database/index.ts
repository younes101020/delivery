import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { CreateDatabaseSchema } from "@/db/dto";

import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { getCreateDatabaseQueue, queueName } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

export async function createDatabase(databaseJobData: CreateDatabaseSchema) {
  const createDbQueue = getCreateDatabaseQueue();
  await createDbQueue.add(queueName, databaseJobData);

  await subscribeWorkerTo(queueName, PROCESSOR_FILE);
}
