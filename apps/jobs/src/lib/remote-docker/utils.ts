import type Dockerode from "dockerode";

export function toServiceSpec(service: Dockerode.Service) {
  const taskTemplate = service.Spec?.TaskTemplate as Dockerode.ContainerTaskSpec;
  const serviceInstanceCount = service.Spec?.Mode?.Replicated?.Replicas ?? 0;
  const name = service.Spec?.Name ?? "Anonymous";
  return {
    id: service.id,
    name,
    image: taskTemplate.ContainerSpec?.Image,
    isActive: serviceInstanceCount > 0,
    isProcessing: false,
    createdAt: service.CreatedAt!,
  };
}
