import type { RemoveQueueApplicationJobFns } from "../types";

import { remove } from "./remove";

export const jobs: RemoveQueueApplicationJobFns = {
  remove,
};
