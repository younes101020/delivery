import type Dockerode from "dockerode";

import { withDocker } from "@/lib/remote-docker/middleware";

import type { ForgeProjectLayout, ForgeStackService } from "./stack-service";

import { createForgeStackServiceSpec } from "./stack-service";

interface StartForgeStackInput {
  project: {
    id: string;
    name: string;
  };
  projectLayout?: ForgeProjectLayout;
  services: ForgeStackService[];
}

interface UpsertForgeStackServiceInput {
  project: { id: string; name: string };
  projectLayout: ForgeProjectLayout;
  service: ForgeStackService;
}

export interface ForgeStackDto {
  id: string;
  name: string;
  layout: ForgeProjectLayout;
  services: Array<ForgeStackService & { serviceId?: string }>;
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
        projectLayout: input.projectLayout,
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

export const upsertForgeStackService = withDocker<{ nodeId: string; serviceId: string; status: "created" | "updated" }, UpsertForgeStackServiceInput>(async (docker, input) => {
  if (!input)
    throw new Error("Forge service data is required.");

  const existingServices = await docker.listServices({ filters: { label: [`delivery.forge.project-id=${input.project.id}`, `delivery.forge.node-id=${input.service.nodeId}`] } });
  const spec = createForgeStackServiceSpec({
    projectId: input.project.id,
    projectName: input.project.name,
    projectLayout: input.projectLayout,
    service: input.service,
  });
  const existingService = existingServices[0];

  if (!existingService) {
    const created = await docker.createService(spec);
    return { nodeId: input.service.nodeId, serviceId: created.id, status: "created" };
  }

  const service = docker.getService(existingService.ID);
  const inspected = await service.inspect();
  await service.update({ ...spec, version: inspected.Version?.Index ?? 0 });
  return { nodeId: input.service.nodeId, serviceId: existingService.ID, status: "updated" };
});

export const listForgeStacks = withDocker<ForgeStackDto[], void>(async (docker) => {
  const services = await docker.listServices({ filters: { label: ["resource=forge"] } });
  const projects = new Map<string, ForgeStackDto>();

  for (const swarmService of services) {
    const spec = swarmService.Spec;
    if (!spec)
      continue;
    const labels = spec?.Labels ?? {};
    const projectId = labels["delivery.forge.project-id"];
    const nodeId = labels["delivery.forge.node-id"];
    const task = spec?.TaskTemplate;
    const container = task && "ContainerSpec" in task ? task.ContainerSpec : undefined;
    const image = container?.Image;
    if (!projectId || !nodeId || !image)
      continue;

    const layout = getProjectLayout(labels);
    const project = projects.get(projectId) ?? {
      id: projectId,
      name: labels["delivery.forge.project-name"] ?? projectId,
      layout,
      services: [],
    };
    project.services.push({
      nodeId,
      serviceId: swarmService.ID,
      image,
      ports: getPorts(spec),
      environmentVariables: (container?.Env ?? []).join("\n"),
      startCommand: (container?.Command ?? []).join(" "),
      layout: { x: getNumberLabel(labels, "delivery.forge.node-x"), y: getNumberLabel(labels, "delivery.forge.node-y") },
    });
    projects.set(projectId, project);
  }

  return [...projects.values()];
});

function getProjectLayout(labels: Record<string, string>) {
  return {
    x: getNumberLabel(labels, "delivery.forge.project-x"),
    y: getNumberLabel(labels, "delivery.forge.project-y"),
    width: getNumberLabel(labels, "delivery.forge.project-width", 240),
    height: getNumberLabel(labels, "delivery.forge.project-height", 160),
  };
}

function getNumberLabel(labels: Record<string, string>, key: string, fallback = 0) {
  const value = Number(labels[key]);
  return Number.isFinite(value) ? value : fallback;
}

function getPorts(spec: Dockerode.ServiceSpec) {
  return (spec.EndpointSpec?.Ports ?? [])
    .map(port => port.PublishedPort ?? port.TargetPort)
    .filter((port): port is number => typeof port === "number")
    .join(", ");
}
