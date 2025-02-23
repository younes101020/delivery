import { DatabaseError } from "@/lib/error";
import { generateRandomString } from "@/lib/utils";
import { docker } from "@/routes/databases/lib/remote-docker/utils";

import type { CreateQueueDatabaseJob } from "../types";

export async function create(job: CreateQueueDatabaseJob<"create">) {
  const { type } = job.data;

  const POSTGRES_PASSWORD = generateRandomString();
  const POSTGRES_USER = generateRandomString();

  const dbContainer = await docker.createContainer({
    Image: type,
    Env: [
      `POSTGRES_USER=${POSTGRES_USER}`,
      `POSTGRES_PASSWORD=${POSTGRES_PASSWORD}`,
    ],
    ExposedPorts: {
      "5432/tcp": {},
    },
    HostConfig: {
      PortBindings: {
        "5432/tcp": [
          {
            HostPort: "5432",
          },
        ],
      },
    },
  });

  await dbContainer.start()
    .catch((error) => {
      throw new DatabaseError({
        name: "START_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
