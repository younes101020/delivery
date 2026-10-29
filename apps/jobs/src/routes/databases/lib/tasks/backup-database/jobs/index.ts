import type { BackupQueueDatabaseJobFns } from "../types";

import { backup } from "./backup";

export const jobs: BackupQueueDatabaseJobFns = {
  backup,
};
