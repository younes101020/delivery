import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { withDocker } from "./middleware";

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

export const getSwarmServiceById = withDocker<Dockerode.Service, string>(async (docker, id) => {
  return docker.getService(id!);
});

export const getSwarmServiceByName = withDocker<Dockerode.Service, string>(async (docker, name) => {
  if (!name)
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, { message: "Service name is required." });

  const services = await docker.listServices({ filters: { name: [name] } });
  if (services.length === 0)
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, { message: `Service with name "${name}" not found.` });

  return services[0];
});
