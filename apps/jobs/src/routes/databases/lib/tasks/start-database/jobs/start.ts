import { DatabaseError } from "@/lib/error";
import { ssh } from "@/lib/ssh";
import { generateRandomString } from "@/lib/utils";

import type { QueueDatabaseJob } from "../types";

export async function start(job: QueueDatabaseJob<"start">) {
  const { type } = job.data;
  await job.updateProgress({ logs: `\nWe start your ${type} database...` });

  const POSTGRES_PASSWORD = generateRandomString();
  const POSTGRES_USER = generateRandomString();

  const fullStartPostgresCmd = `docker run -l "delivery.resource=database" -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -p 5432:5432 --restart unless-stopped --network host_network -d ${type}`;

  await ssh(fullStartPostgresCmd)
    .catch((error) => {
      throw new DatabaseError({
        name: "START_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
