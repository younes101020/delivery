import { Queue } from "bullmq";

import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllStartQueueDatabaseJobsData } from "./types";

import { PREFIX, queueNames } from "../const";

export const queueName = queueNames.START;

export function getStartDatabaseQueue() {
  return new Queue<AllStartQueueDatabaseJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}
