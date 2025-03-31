import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { withDocker } from "@/lib/remote-docker/middleware";

const listDatabaseServices = withDocker<Dockerode.Service[], Dockerode.ServiceListOptions>(
  async (docker, opts) => {
    const inputFilters = opts && typeof opts.filters === "object" ? opts.filters : {};
    return await docker.listServices({ filters: { label: ["resource=database"], ...inputFilters } });
  },
);

export function withDatabaseService<T>(
  cb: (dbServices: Dockerode.Service) => Promise<T>,
) {
  return async (appQuery: Dockerode.ServiceListOptions["filters"]) => {
    const servicesList = await listDatabaseServices({ filters: appQuery });
    if (servicesList.length === 0)
      throw new Error("Database service not found.");
    return cb(servicesList[0]);
  };
}

export function withRestDatabaseService<T>(cb: (dbServices: Dockerode.Service) => Promise<T>) {
  return async (appQuery: Dockerode.ServiceListOptions["filters"]) => {
    try {
      const servicesList = await listDatabaseServices({ filters: appQuery });
      if (servicesList.length === 0)
        throw new Error("Database service not found.");
      return cb(servicesList[0]);
    }
    catch (error) {
      throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  };
}
