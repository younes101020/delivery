import type { RemoveQueueDatabaseJobFns } from "../types";

import { remove } from "./remove";

export const jobs: RemoveQueueDatabaseJobFns = {
  remove,
};
