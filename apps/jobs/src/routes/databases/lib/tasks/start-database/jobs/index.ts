import type { StartQueueDatabaseJobFns } from "../types";

import { start } from "./start";

export const jobs: StartQueueDatabaseJobFns = {
  start,
};
