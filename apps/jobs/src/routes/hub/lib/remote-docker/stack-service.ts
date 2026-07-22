import type Dockerode from "dockerode";

import { CLUSTER_NETWORK_NAME } from "@/lib/remote-docker/const";

export interface ForgeStackService {
  nodeId: string;
  image: string;
  ports: string;
  environmentVariables: string;
  startCommand: string;
}

interface CreateForgeStackServiceSpecInput {
  projectId: string;
  projectName: string;
  service: ForgeStackService;
}

export function createForgeStackServiceSpec({ projectId, projectName, service }: CreateForgeStackServiceSpecInput): Dockerode.ServiceSpec {
  const ports = parsePorts(service.ports);
  const environmentVariables = parseEnvironmentVariables(service.environmentVariables);
  const command = service.startCommand.trim();

  return {
    Name: getForgeServiceName(projectId, service.nodeId),
    TaskTemplate: {
      ContainerSpec: {
        Image: service.image,
        ...(environmentVariables.length > 0 ? { Env: environmentVariables } : {}),
        ...(command ? { Command: command.split(/\s+/) } : {}),
      },
      Networks: [{ Target: CLUSTER_NETWORK_NAME }],
      RestartPolicy: {
        Condition: "on-failure",
        Delay: 5,
        MaxAttempts: 3,
      },
    },
    Mode: {
      Replicated: {
        Replicas: 1,
      },
    },
    Labels: {
      "resource": "forge",
      "com.docker.stack.namespace": getStackNamespace(projectName),
      "delivery.forge.project-id": projectId,
      "delivery.forge.node-id": service.nodeId,
    },
    EndpointSpec: ports.length > 0
      ? {
          Ports: ports.map(port => ({
            Protocol: "tcp",
            PublishedPort: port,
            TargetPort: port,
          })),
        }
      : undefined,
  };
}

export function getForgeServiceName(projectId: string, nodeId: string) {
  return `forge-${sanitizeName(projectId)}-${sanitizeName(nodeId)}`;
}

export function parsePorts(value: string) {
  if (!value.trim())
    return [];

  return value.split(",").map((port) => {
    const parsedPort = Number(port.trim());
    if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535)
      throw new Error(`Invalid port: ${port.trim() || "empty value"}.`);

    return parsedPort;
  });
}

export function parseEnvironmentVariables(value: string) {
  return value
    .split("\n")
    .map(variable => variable.trim())
    .filter(Boolean)
    .map((variable) => {
      if (!/^[A-Z_]\w*=.*/i.test(variable))
        throw new Error(`Invalid environment variable: ${variable}.`);

      return variable;
    });
}

function getStackNamespace(projectName: string) {
  return sanitizeName(projectName);
}

function sanitizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 63) || "forge";
}
