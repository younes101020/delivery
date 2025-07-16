import type Dockerode from "dockerode";

import { APPLICATION_INSTANCE_REPLICAS } from "@/routes/applications/lib/remote-docker/const";

interface ApplicationServiceSpec {
  applicationName: string;
  image: string;
  port: number;
  fqdn: string;
  plainEnv?: string[];
  networkId: string;
}

export function createApplicationServiceSpec({ applicationName, image, port, plainEnv, networkId, fqdn }: ApplicationServiceSpec) {
  const manifest: Dockerode.ServiceSpec = {
    Name: applicationName,
    TaskTemplate: {
      ContainerSpec: {
        Image: image,
        Env: plainEnv ? ["CI=false", ...plainEnv] : ["CI=false"],
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
    Labels: {
      "resource": "application",
      "traefik.enable": "true",
      [`traefik.http.routers.${applicationName}.entrypoints`]: "web-secure",
      [`traefik.http.routers.${applicationName}.tls`]: "true",
      [`traefik.http.routers.${applicationName}.tls.certresolver`]: "deliveryresolver",
      [`traefik.http.routers.${applicationName}.rule`]: `Host(\`${fqdn.split("/")[0]}\`) && PathPrefix(\`/${applicationName}\`)`,
      [`traefik.http.services.${applicationName}.loadbalancer.server.port`]: port.toString(),
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
