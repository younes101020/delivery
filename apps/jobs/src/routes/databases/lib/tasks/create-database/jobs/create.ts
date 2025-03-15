import { DatabaseError } from "@/lib/error";
import { docker } from "@/lib/remote-docker";
import { generateRandomString } from "@/lib/utils";

import type { CreateQueueDatabaseJob } from "../types";

export async function create(job: CreateQueueDatabaseJob<"create">) {
  const { type } = job.data;

  const DB_USER = generateRandomString();
  const DB_PASSWORD = generateRandomString();

  let options;

  switch (type) {
    case "postgres":
      options = {
        Env: [
          `POSTGRES_USER=${DB_USER}`,
          `POSTGRES_PASSWORD=${DB_PASSWORD}`,
        ],
        ExposedPorts: {
          "5432/tcp": {},
        },
        HostConfig: {
          PortBindings: {
            "5432/tcp": [
              {
                HostPort: "",
              },
            ],
          },
        },
      };
      break;
    case "mongo":
      options = {
        Env: [
          `MONGO_INITDB_ROOT_USERNAME=${DB_USER}`,
          `MONGO_INITDB_ROOT_PASSWORD=${DB_PASSWORD}`,
        ],
        ExposedPorts: {
          "27017/tcp": {},
        },
        HostConfig: {
          PortBindings: {
            "27017/tcp": [
              {
                HostPort: "",
              },
            ],
          },
        },
      };
      break;
    default:
      throw new DatabaseError({
        name: "CREATE_DATABASE_ERROR",
        message: "Database type not supported",
      });
  }

  const dbContainer = await docker.createContainer({
    Image: type,
    Labels: {
      resource: "database",
    },
    ...options,
  }).catch((error) => {
    throw new DatabaseError({
      name: "CREATE_DATABASE_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error",
    });
  });

  await dbContainer.start()
    .catch((error) => {
      throw new DatabaseError({
        name: "START_DATABASE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    });
}
