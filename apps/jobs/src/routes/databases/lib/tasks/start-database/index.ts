import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { CreateDatabaseSchema } from "@/db/dto";

import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { getDatabaseQueue } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

const jobs = {
  START: "start",
};

export async function startDatabase(databaseJobData: CreateDatabaseSchema) {
  const queueName = databaseJobData.type;
  const dbQueue = getDatabaseQueue(queueName);
  await dbQueue.add(jobs.START, databaseJobData);

  await subscribeWorkerTo(queueName, PROCESSOR_FILE);
}
