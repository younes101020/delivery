import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import env from "@/env";
import { subscribeWorkerTo } from "@/lib/tasks/utils";

import { PREFIX, queueName } from "./utils";

const PROCESSOR_FILE = join(dirname(fileURLToPath(import.meta.url)), env.NODE_ENV === "production" ? "../worker.js" : "../worker.ts");

export function startDatabaseBackupWorker() {
  return subscribeWorkerTo(queueName, PREFIX, PROCESSOR_FILE);
}
