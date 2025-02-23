import type { CreateQueueDatabaseJobFns } from "../types";

import { create } from "./create";

export const jobs: CreateQueueDatabaseJobFns = {
  create,
};
