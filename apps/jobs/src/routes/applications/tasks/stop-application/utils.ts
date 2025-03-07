import { Queue } from "bullmq";

import { queueNames } from "@/lib/tasks/const";
import { connection, getBullConnection } from "@/lib/tasks/utils";

import type { AllStopQueueApplicationJobsData } from "./types";

import { PREFIX } from "../const";

export const queueName = queueNames.STOP;

export function getStartDatabaseQueue() {
  return new Queue<AllStopQueueApplicationJobsData>(queueName, { connection: getBullConnection(connection), prefix: PREFIX });
}
