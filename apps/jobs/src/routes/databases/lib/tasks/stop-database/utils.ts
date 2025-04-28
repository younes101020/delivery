import { Queue } from "bullmq";

import { queueNames } from "@/lib/tasks/const";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllStopQueueDatabaseJobsData } from "./types";

import { PREFIX } from "../const";

export const queueName = queueNames.STOP;

export function getStopDatabaseQueue() {
  return new Queue<AllStopQueueDatabaseJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}
