import type Dockerode from "dockerode";

import { DeploymentError } from "@/lib/error";

interface ApplicationServiceSpec {
  applicationName: string;
  image: string;
  fqdn: string;
  port: number;
  plainEnv?: string[];
  networkId: string;
}

const APPLICATION_INSTANCE_REPLICAS = 2;

export function createApplicationServiceSpecAsBlue({ applicationName, image, fqdn, port, plainEnv, networkId }: ApplicationServiceSpec) {
  const manifest: Dockerode.ServiceSpec = {
    Name: `${applicationName}-${Date.now()}`,
    TaskTemplate: {
      ContainerSpec: {
        Image: image,
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
    Labels: {
      "resource": "application",
      "traefik.enable": "true",
      [`traefik.http.routers.${applicationName}.priority`]: "100",
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

export async function SwitchFromBlueToGreen(applicationName: string, docker: Dockerode) {
  const blueAndGreenServices = await docker.listServices({ filters: { label: ["resource=application"] } });

  const blueServiceId = blueAndGreenServices.find(service => service.Spec?.Name === `${applicationName}-blue`)?.id;
  const greenServiceId = blueAndGreenServices.find(service => service.Spec?.Name === `${applicationName}-green`)?.id;

  if (!blueServiceId || !greenServiceId) {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: "Blue or Green service not found, we can't switch from blue to green. Redeployment failed.",
    });
  }

  await docker.getService(blueServiceId).update({
    Spec: {
      Labels: {
        "traefik.http.routers.service_name.priority": "0",
      },
    },
  });

  await docker.getService(greenServiceId).update({
    Spec: {
      Labels: {
        "traefik.http.routers.service_name.priority": "100",
      },
    },
  });
}
