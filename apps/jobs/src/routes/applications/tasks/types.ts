import type { MergeSubJobs } from "@/lib/tasks/types";

import type { RemoveQueueApplicationJobData } from "./remove-application/types";
import type { StartQueueApplicationJobData } from "./start-application/types";
import type { StopQueueApplicationJobData } from "./stop-application/types";

type QueueApplicationJobData = StartQueueApplicationJobData & StopQueueApplicationJobData & RemoveQueueApplicationJobData;
export type AllQueueApplicationJobsData = MergeSubJobs<QueueApplicationJobData>;
