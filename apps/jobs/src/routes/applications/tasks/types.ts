import type { MergeSubJobs } from "@/lib/tasks/types";

import type { StartQueueApplicationJobData } from "./start-application/types";
import type { StopQueueApplicationJobData } from "./stop-application/types";

type QueueApplicationJobData = StartQueueApplicationJobData & StopQueueApplicationJobData;
export type AllQueueApplicationJobsData = MergeSubJobs<QueueApplicationJobData>;
