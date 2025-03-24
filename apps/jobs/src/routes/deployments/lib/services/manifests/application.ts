import type Dockerode from "dockerode";

interface ApplicationServiceSpec {
  applicationName: string;
  image: string;
  fqdn: string;
  port: number;
  plainEnv?: string[];
  includeApplicationProxy?: boolean;
  networkId: string;
}

const APPLICATION_INSTANCE_REPLICAS = 3;

export function createApplicationServiceSpec({ applicationName, image, fqdn, port, plainEnv, includeApplicationProxy = false, networkId }: ApplicationServiceSpec) {
  const manifest: Dockerode.ServiceSpec = {
    Name: `${applicationName}-${Date.now()}`,
    TaskTemplate: {
      ContainerSpec: {
        Image: image,
        Labels: includeApplicationProxy
          ? {
              "resource": "application",
              "traefik.enable": "true",
              [`traefik.http.routers.${applicationName}.rule`]: `Host(\`${fqdn}\`)`,
              [`traefik.http.services.${applicationName}.loadbalancer.server.port`]: port.toString(),
            }
          : {},
        Env: plainEnv ? ["CI=false", ...plainEnv] : ["CI=false"],
      },
      Placement: {
        Constraints: ["node.role == worker"],
      },
      Networks: [
        {
          Target: networkId,
        },
      ],
      RestartPolicy: {
        Condition: "on-failure",
        Delay: 5,
        MaxAttempts: 3,
      },
    },
    Mode: {
      Replicated: {
        Replicas: APPLICATION_INSTANCE_REPLICAS,
      },
    },
    UpdateConfig: {
      Parallelism: 1,
      Delay: 10,
      FailureAction: "rollback",
      Order: "stop-first",
    },
  };
  return manifest;
}
