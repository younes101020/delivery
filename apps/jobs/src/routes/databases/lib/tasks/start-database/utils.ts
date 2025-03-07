import { Queue } from "bullmq";

import { queueNames } from "@/lib/tasks/const";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllStartQueueDatabaseJobsData } from "./types";

import { PREFIX } from "../const";

export const queueName = queueNames.START;

export function getStartDatabaseQueue() {
  return new Queue<AllStartQueueDatabaseJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}
