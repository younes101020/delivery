import type { StopQueueDatabaseJobFns } from "../types";

import { stop } from "./stop";

export const jobs: StopQueueDatabaseJobFns = {
  stop,
};
