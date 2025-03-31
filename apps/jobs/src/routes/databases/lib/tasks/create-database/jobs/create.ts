import { createDatabaseService } from "@/routes/databases/lib/remote-docker/service-tasks";

import type { CreateQueueDatabaseJob } from "../types";

export async function create(job: CreateQueueDatabaseJob<"create">) {
  const { type, name } = job.data;
  await createDatabaseService({ databaseImage: type, databaseName: name });
}
