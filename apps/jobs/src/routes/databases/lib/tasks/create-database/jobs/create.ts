import { DatabaseError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";
import { generateRandomString } from "@/lib/utils";

import type { CreateQueueDatabaseJob } from "../types";

export async function create(job: CreateQueueDatabaseJob<"create">) {
  const { type, name } = job.data;
  const docker = await getDocker();

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
          RestartPolicy: {
            Name: "unless-stopped",
          },
          PublishAllPorts: true,
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
          RestartPolicy: {
            Name: "unless-stopped",
          },
          PublishAllPorts: true,
        },
      };
      break;
    default:
      throw new DatabaseError({
        name: "CREATE_DATABASE_ERROR",
        message: "Database type not supported",
      });
  }

  await docker.createContainer({
    Image: type,
    name,
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
}
