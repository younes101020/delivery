import type { StartQueueApplicationJobFns } from "../types";

import { start } from "./start";

export const jobs: StartQueueApplicationJobFns = {
  start,
};
