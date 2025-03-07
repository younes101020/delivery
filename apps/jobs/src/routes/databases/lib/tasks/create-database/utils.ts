import { Queue, QueueEvents } from "bullmq";

import { prefix, queueNames } from "@/lib/tasks/const";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllCreateQueueDatabaseJobsData } from "./types";

export const queueName = queueNames.CREATE;
export const PREFIX = prefix.DATABASE;

export function getCreateDatabaseQueue() {
  return new Queue<AllCreateQueueDatabaseJobsData>(queueName, { connection: getBullConnection(connection), prefix: prefix.DATABASE });
}

export function getCreateDatabaseQueueEvents() {
  return new QueueEvents(queueName, { connection: getBullConnection(connection), prefix: prefix.DATABASE });
}
