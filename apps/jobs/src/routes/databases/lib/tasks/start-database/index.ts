import { Queue } from "bullmq";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { CreateDatabaseSchema } from "@/db/dto";

import { connection, getBullConnection, subscribeWorkerTo } from "@/lib/tasks/utils";

import type { AllDatabaseJobsData } from "./types";

const QUEUE_NAME = "database";
const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), "../worker.ts");

export async function startDatabase(databaseJobData: CreateDatabaseSchema) {
  const dbQueue = new Queue<AllDatabaseJobsData>(QUEUE_NAME, { connection: getBullConnection(connection) });
  await dbQueue.add("start", databaseJobData);

  await subscribeWorkerTo(QUEUE_NAME, PROCESSOR_FILE);
}
