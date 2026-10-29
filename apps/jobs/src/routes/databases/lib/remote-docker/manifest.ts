import type Dockerode from "dockerode";

import { CLUSTER_NETWORK_NAME } from "@/lib/remote-docker/const";

import type { Database } from "../dto";

import { DATABASE_INSTANCE_REPLICAS, DATABASE_NODE_CONSTRAINT, databaseDataDirectories } from "./const";

interface DatabaseServiceSpec {
  database: Database;
  initialEnvCreds: string[];
  name: string;
  port: number;
  plainEnv?: string[];
}

export function createDatabaseServiceSpec({ database, name, port, initialEnvCreds }: DatabaseServiceSpec) {
  const manifest: Dockerode.ServiceSpec = {
    Name: name,
    TaskTemplate: {
      ContainerSpec: {
        Image: database,
        Env: initialEnvCreds,
        Mounts: [
          {
            Type: "volume",
            Source: `delivery-${name}-data`,
            Target: databaseDataDirectories[database],
          },
        ],
      },
      Placement: {
        Constraints: [DATABASE_NODE_CONSTRAINT],
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
        Replicas: DATABASE_INSTANCE_REPLICAS,
      },
    },
    Labels: {
      "resource": "database",
      "delivery.database.type": database,
      "traefik.enable": "true",
      "traefik.swarm.network": CLUSTER_NETWORK_NAME,
      [`traefik.tcp.routers.${name}.rule`]: "HostSNI(`*`)",
      [`traefik.tcp.routers.${name}.entrypoints`]: database,
      [`traefik.tcp.routers.${name}.service`]: name,
      [`traefik.tcp.services.${name}.loadbalancer.server.port`]: port.toString(),
    },
  };
  return manifest;
}
