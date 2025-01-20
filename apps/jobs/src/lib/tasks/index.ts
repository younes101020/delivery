import { Worker } from "bullmq";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { connection, getBullConnection } from "./utils";

const processorFile = join(dirname(fileURLToPath(import.meta.url)), "worker.ts");

export async function createWorker(queueName: string) {
  const worker = new Worker(queueName, processorFile, {
    connection: getBullConnection(connection),
  });

  worker.on("error", (error) => {
    if (error instanceof Error) {
      console.error("Error: ", error);
    }
  });
  worker.on("failed", (_, error) => {
    if (error instanceof Error) {
      console.error("Job failed: ", error);
    }
  });

  return worker;
}
