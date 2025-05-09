import type Dockerode from "dockerode";

import { APPLICATION_INSTANCE_REPLICAS } from "@/routes/applications/lib/remote-docker/const";

interface ApplicationServiceSpec {
  applicationName: string;
  image: string;
  fqdn: string;
  port: number;
  plainEnv?: string[];
  networkId: string;
}

export function createApplicationServiceSpec({ applicationName, image, fqdn, port, plainEnv, networkId }: ApplicationServiceSpec) {
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
      [`traefik.http.routers.${applicationName}.tls.certresolver`]: "tlschallenge",
      [`traefik.http.routers.${applicationName}.middlewares`]: "secHeaders@file",
      [`traefik.http.routers.${applicationName}.rule`]: `Host(\`${fqdn}\`)`,
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
