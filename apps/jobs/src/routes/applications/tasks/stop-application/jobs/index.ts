import type { StopQueueApplicationJobFns } from "../types";

import { stop } from "./stop";

export const jobs: StopQueueApplicationJobFns = {
  stop,
};
