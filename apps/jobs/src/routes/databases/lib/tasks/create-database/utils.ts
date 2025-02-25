import { Queue, QueueEvents } from "bullmq";

import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllCreateQueueDatabaseJobsData } from "./types";

import { PREFIX, queueNames } from "../const";

export const queueName = queueNames.CREATE;

export function getCreateDatabaseQueue() {
  return new Queue<AllCreateQueueDatabaseJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}

export function getCreateDatabaseQueueEvents() {
  return new QueueEvents(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}
