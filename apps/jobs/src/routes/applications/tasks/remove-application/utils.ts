import { Queue } from "bullmq";

import { queueNames } from "@/lib/tasks/const";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllRemoveQueueApplicationJobsData } from "./types";

import { PREFIX } from "../const";

export const queueName = queueNames.REMOVE;

export function getRemoveDatabaseQueue() {
  return new Queue<AllRemoveQueueApplicationJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}
