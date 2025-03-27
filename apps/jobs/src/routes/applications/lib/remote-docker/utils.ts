import type Dockerode from "dockerode";

import type { ServicesDto } from "@/db/dto/services.dto";

import { ApplicationError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";

import { APPLICATION_INSTANCE_REPLICAS } from "./const";

type ApplicationService = Omit<ServicesDto, "isProcessing">;

type CallbackParam = (appServices: Dockerode.Service) => Promise<void | ApplicationService>;

function withApplicationsServices(
  cb: CallbackParam,
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

export const startApplicationServiceByName = withApplicationsServices(async (appServices) => {
  await appServices.update({ Spec: { Mode: { Replicated: { Replicas: APPLICATION_INSTANCE_REPLICAS } } } });
});

export const stopApplicationServiceByName = withApplicationsServices(async (appServices) => {
  await appServices.update({ Spec: { Mode: { Replicated: { Replicas: 0 } } } });
});

export const removeApplicationServiceByName = withApplicationsServices(async (appServices) => {
  await appServices.remove();
});

export const getApplicationServiceByName = withApplicationsServices(async (appServices) => {
  const appService = toApplicationServiceSpec(appServices);
  return appService;
});

export async function listApplicationServicesSpec(opts?: Dockerode.ServiceListOptions) {
  const docker = await getDocker();
  const inputFilters = typeof opts?.filters === "object" ? opts.filters : {};
  const appServices = await docker.listServices({ filters: { label: ["resource=application"], ...inputFilters } });
  return appServices.map(toApplicationServiceSpec);
}

function toApplicationServiceSpec(service: Dockerode.Service) {
  const taskTemplate = service.Spec?.TaskTemplate as Dockerode.ContainerTaskSpec;
  const appInstanceCount = service.Spec?.Mode?.Replicated?.Replicas ?? 0;
  const name = service.Spec?.Name ?? "Anonymous application";
  return {
    id: service.id,
    name,
    image: taskTemplate.ContainerSpec?.Image,
    isActive: appInstanceCount > 0,
    isProcessing: false,
    createdAt: service.CreatedAt!,
  };
}

export async function listApplicationServices(opts?: Dockerode.ServiceListOptions) {
  const docker = await getDocker();
  const inputFilters = typeof opts?.filters === "object" ? opts.filters : {};
  return await docker.listServices({ filters: { label: ["resource=application"], ...inputFilters } });
}
