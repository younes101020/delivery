import type Dockerode from "dockerode";

import { describe, expect, it } from "vitest";

import { createForgeStackServiceSpec, parseEnvironmentVariables, parsePorts } from "../stack-service";

describe("forge stack service manifest", () => {
  it("maps node settings to a published Swarm service", () => {
    const service = createForgeStackServiceSpec({
      projectId: "project-1",
      projectName: "My Stack",
      service: {
        nodeId: "node-1",
        image: "nginx:latest",
        ports: "80, 443",
        environmentVariables: "MODE=production\nDEBUG=false",
        startCommand: "nginx -g daemon off;",
      },
    });
    const taskTemplate = service.TaskTemplate as Dockerode.ContainerTaskSpec;

    expect(service.Name).toBe("forge-project-1-node-1");
    expect(service.Labels?.["com.docker.stack.namespace"]).toBe("my-stack");
    expect(taskTemplate.ContainerSpec?.Env).toEqual(["MODE=production", "DEBUG=false"]);
    expect(taskTemplate.ContainerSpec?.Command).toEqual(["nginx", "-g", "daemon", "off;"]);
    expect(service.EndpointSpec?.Ports).toEqual([
      { Protocol: "tcp", PublishedPort: 80, TargetPort: 80 },
      { Protocol: "tcp", PublishedPort: 443, TargetPort: 443 },
    ]);
  });

  it("rejects invalid ports and environment variables", () => {
    expect(() => parsePorts("0")).toThrow("Invalid port");
    expect(() => parseEnvironmentVariables("INVALID")).toThrow("Invalid environment variable");
  });
});
