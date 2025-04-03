import type Dockerode from "dockerode";

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
