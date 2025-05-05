import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { CreateDatabaseSchema } from "@/db/dto";

import env from "@/env";
import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { getCreateDatabaseQueue, PREFIX, queueName } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), env.NODE_ENV === "production" ? "../worker.js" : "../worker.ts");

export async function createDatabase(databaseJobData: CreateDatabaseSchema) {
  subscribeWorkerTo(queueName, PREFIX, PROCESSOR_FILE);

  const createDbQueue = getCreateDatabaseQueue();
  await createDbQueue.add(queueName, databaseJobData);
}
