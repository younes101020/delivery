import type Dockerode from "dockerode";

export interface ForgeStackService {
  nodeId: string;
  image: string;
  ports: string;
  environmentVariables: string;
  startCommand: string;
  layout?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
}

interface CreateForgeStackServiceSpecInput {
  projectId: string;
  projectName: string;
  projectLayout?: ForgeProjectLayout;
  service: ForgeStackService;
}

export interface ForgeProjectLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const FORGE_NETWORK_NAME = "forge";
const MAX_SERVICE_NAME_LENGTH = 63;
const SERVICE_NAME_HASH_LENGTH = 8;

export function createForgeStackServiceSpec({ projectId, projectName, projectLayout, service }: CreateForgeStackServiceSpecInput): Dockerode.ServiceSpec {
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
      Networks: [{ Target: FORGE_NETWORK_NAME }],
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
      "delivery.forge.project-name": projectName,
      "delivery.forge.node-id": service.nodeId,
      "delivery.forge.schema-version": "1",
      "delivery.forge.node-x": String(service.layout?.x ?? 0),
      "delivery.forge.node-y": String(service.layout?.y ?? 0),
      "delivery.forge.node-width": String(service.layout?.width ?? 200),
      "delivery.forge.node-height": String(service.layout?.height ?? 68),
      ...(projectLayout
        ? {
            "delivery.forge.project-x": String(projectLayout.x),
            "delivery.forge.project-y": String(projectLayout.y),
            "delivery.forge.project-width": String(projectLayout.width),
            "delivery.forge.project-height": String(projectLayout.height),
          }
        : {}),
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
  const name = `forge-${sanitizeName(projectId)}-${sanitizeName(nodeId)}`;

  if (name.length <= MAX_SERVICE_NAME_LENGTH)
    return name;

  const prefixLength = MAX_SERVICE_NAME_LENGTH - SERVICE_NAME_HASH_LENGTH - 1;
  return `${name.slice(0, prefixLength)}-${getNameHash(name)}`;
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

function getNameHash(value: string) {
  let hash = 0x811C9DC5;

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36).padStart(SERVICE_NAME_HASH_LENGTH, "0").slice(-SERVICE_NAME_HASH_LENGTH);
}
