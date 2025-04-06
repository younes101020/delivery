import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { getDocker } from ".";

export function toServiceSpec(service: Dockerode.Service) {
  const taskTemplate = service.Spec?.TaskTemplate as Dockerode.ContainerTaskSpec;
  const serviceInstanceCount = service.Spec?.Mode?.Replicated?.Replicas ?? 0;
  const name = service.Spec?.Name ?? "Anonymous";
  return {
    id: service.ID,
    name,
    image: taskTemplate.ContainerSpec?.Image,
    isActive: serviceInstanceCount > 0,
    isProcessing: false,
    createdAt: service.CreatedAt!,
  };
}

export function withDocker<T, K>(fn: (docker: Dockerode, args?: K) => Promise<T>) {
  return async (args?: K) => {
    const docker = await getDocker();
    return fn(docker, args);
  };
}

export const getSwarmServiceById = withDocker<Dockerode.Service, string>(async (docker, id) => {
  const service = docker.getService(id!);
  const serviceMetadata = await service.inspect();
  return serviceMetadata;
});

export const getSwarmServiceByName = withDocker<Dockerode.Service, string>(async (docker, name) => {
  if (!name)
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, { message: "Service name is required." });

  const services = await docker.listServices({ filters: { name: [name] } });
  if (services.length === 0)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: `Service with name "${name}" not found.` });

  return services[0];
});
