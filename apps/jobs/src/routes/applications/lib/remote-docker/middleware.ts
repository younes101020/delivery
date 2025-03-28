import type Dockerode from "dockerode";

import { ApplicationError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";

export function withApplicationsServices<T>(
  cb: (appServices: Dockerode.Service) => Promise<T>,
) {
  return async (appQuery: Dockerode.ServiceListOptions["filters"]) => {
    try {
      const servicesList = await listApplicationServices({ filters: appQuery });
      if (servicesList.length === 0)
        throw new Error("Application service not found.");
      return cb(servicesList[0]);
    }
    catch (error) {
      console.error(error);
      throw new ApplicationError({
        name: "APPLICATION_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  };
}

async function listApplicationServices(opts?: Dockerode.ServiceListOptions) {
  const docker = await getDocker();
  const inputFilters = typeof opts?.filters === "object" ? opts.filters : {};
  return await docker.listServices({ filters: { label: ["resource=application"], ...inputFilters } });
}
