import type Dockerode from "dockerode";

import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { getDocker } from ".";

const checkIfResourceRunning = withDocker<boolean, string>(async (docker, serviceName) => {
  const serviceTask = await docker.listTasks({ filters: { service: [serviceName] } });
  if (serviceTask.length > 0) {
    return serviceTask.some(t => t.Status.State === "running");
  }
  return false;
});

export async function toServiceSpec(service: Dockerode.Service) {
  const taskTemplate = service.Spec?.TaskTemplate as Dockerode.ContainerTaskSpec;
  const name = service.Spec?.Name ?? "Anonymous";
  const isActive = await checkIfResourceRunning(service.Spec?.Name);
  return {
    id: service.ID,
    name,
    image: taskTemplate.ContainerSpec?.Image,
    isActive,
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
