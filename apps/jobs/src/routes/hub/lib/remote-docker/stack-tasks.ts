import { withDocker } from "@/lib/remote-docker/middleware";

import type { ForgeStackService } from "./stack-service";

import { createForgeStackServiceSpec } from "./stack-service";

interface StartForgeStackInput {
  project: {
    id: string;
    name: string;
  };
  services: ForgeStackService[];
}

export interface StartForgeStackResult {
  nodeId: string;
  serviceId?: string;
  status: "created" | "failed" | "updated";
  error?: string;
}

export const startForgeStack = withDocker<StartForgeStackResult[], StartForgeStackInput>(async (docker, input) => {
  if (!input)
    throw new Error("Stack data is required.");

  const existingServices = await docker.listServices({
    filters: {
      label: [`delivery.forge.project-id=${input.project.id}`],
    },
  });
  const existingServicesByNodeId = new Map(
    existingServices
      .map(service => [service.Spec?.Labels?.["delivery.forge.node-id"], service] as const)
      .filter((entry): entry is [string, typeof entry[1]] => Boolean(entry[0])),
  );

  return await Promise.all(input.services.map(async (service) => {
    try {
      const serviceSpec = createForgeStackServiceSpec({
        projectId: input.project.id,
        projectName: input.project.name,
        service,
      });
      const existingService = existingServicesByNodeId.get(service.nodeId);

      if (!existingService) {
        const createdService = await docker.createService(serviceSpec);
        return { nodeId: service.nodeId, serviceId: createdService.id, status: "created" };
      }

      const swarmService = docker.getService(existingService.ID);
      const inspectedService = await swarmService.inspect();
      await swarmService.update({
        ...serviceSpec,
        version: inspectedService.Version?.Index ?? 0,
      });

      return { nodeId: service.nodeId, serviceId: existingService.ID, status: "updated" };
    }
    catch (error) {
      return {
        nodeId: service.nodeId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unexpected error occurred while starting the service.",
      };
    }
  }));
});
