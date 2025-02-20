import type { QueueDatabaseJobFns } from "../types";

import { start } from "./start";

export const jobs: QueueDatabaseJobFns = {
  start,
};
