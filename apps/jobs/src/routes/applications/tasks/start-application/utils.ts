import { Queue } from "bullmq";

import { queueNames } from "@/lib/tasks/const";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllStartQueueApplicationJobsData } from "./types";

import { PREFIX } from "../const";

export const queueName = queueNames.START;

export function getStartDatabaseQueue() {
  return new Queue<AllStartQueueApplicationJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}
