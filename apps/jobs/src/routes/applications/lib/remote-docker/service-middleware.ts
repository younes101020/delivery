import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";

import { withDocker } from "@/lib/remote-docker/middleware";

const listApplicationServices = withDocker<Dockerode.Service[], Dockerode.ServiceListOptions>(
  async (docker, opts) => {
    const inputFilters = opts && typeof opts.filters === "object" ? opts.filters : {};
    return await docker.listServices({ filters: { label: ["resource=application"], ...inputFilters } });
  },
);

export function withApplicationsServices<T>(
  cb: (appServices: Dockerode.Service) => Promise<T>,
) {
  return async (appQuery: Dockerode.ServiceListOptions["filters"]) => {
    const servicesList = await listApplicationServices({ filters: appQuery });
    if (servicesList.length === 0)
      throw new Error("Application service not found.");
    return cb(servicesList[0]);
  };
}

export function withRestApplicationService<V, T>(cb: (appServices: Dockerode.Service, args: V) => Promise<T>) {
  return async (appQuery: Dockerode.ServiceListOptions["filters"], args: V) => {
    const servicesList = await listApplicationServices({ filters: appQuery })
      .catch((error) => {
        throw new HTTPException(
          500,
          { message: error instanceof Error ? error.message : "Unexpected error, we can't find the application service." },
        );
      });
    return cb(servicesList[0], args);
  };
}
