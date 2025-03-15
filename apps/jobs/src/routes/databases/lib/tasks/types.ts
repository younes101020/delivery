import type { MergeSubJobs } from "@/lib/tasks/types";

import type { CreateQueueDatabaseJobData } from "./create-database/types";
import type { RemoveQueueDatabaseJobData } from "./remove-database/types";
import type { StartQueueDatabaseJobData } from "./start-database/types";
import type { StopQueueDatabaseJobData } from "./stop-database/types";

type QueueDatabaseJobData = CreateQueueDatabaseJobData & StartQueueDatabaseJobData & StopQueueDatabaseJobData & RemoveQueueDatabaseJobData;
export type AllQueueDatabaseJobsData = MergeSubJobs<QueueDatabaseJobData>;
