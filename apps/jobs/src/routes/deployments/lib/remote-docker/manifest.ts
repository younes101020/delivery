import type Dockerode from "dockerode";

import { CLUSTER_NETWORK_NAME } from "@/lib/remote-docker/const";
import { APPLICATION_INSTANCE_REPLICAS } from "@/routes/applications/lib/remote-docker/const";

interface ApplicationServiceSpec {
  applicationName: string;
  image: string;
  port: number;
  fqdn: string;
  plainEnv?: string[];
  enableTls: boolean;
  // networkId: string;
}

export function createApplicationServiceSpec({ applicationName, image, port, plainEnv, fqdn, enableTls }: ApplicationServiceSpec) {
  const manifest: Dockerode.ServiceSpec = {
    Name: applicationName,
    TaskTemplate: {
      ContainerSpec: {
        Image: image,
        Env: plainEnv ? ["CI=false", ...plainEnv] : ["CI=false"],
      },
      Networks: [
        {
          Target: CLUSTER_NETWORK_NAME,
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
      "traefik.swarm.network": CLUSTER_NETWORK_NAME,
      [`traefik.http.routers.${applicationName}.rule`]: `Host(\`${fqdn}\`)`,
      [`traefik.http.services.${applicationName}.loadbalancer.server.port`]: port.toString(),
      ...(enableTls
        ? {
            [`traefik.http.routers.${applicationName}.entrypoints`]: "web-secure",
            [`traefik.http.routers.${applicationName}.middlewares`]: "redirect-to-https",
            "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme": "https",
            [`traefik.http.routers.${applicationName}.tls`]: "true",
            [`traefik.http.routers.${applicationName}.tls.certresolver`]: "deliveryresolver",
          }
        : {
            [`traefik.http.routers.${applicationName}.entrypoints`]: "web",
          }),
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
