import type Dockerode from "dockerode";

import { DeploymentError } from "@/lib/error";

export async function deleteAppServiceByName(applicationName: string, docker: Dockerode) {
  const appsServices = await docker.listServices({ filters: { label: ["resource=application"] } });
  const appService = appsServices.find(service => service.Spec?.Name === applicationName);
  return await appService?.remove();
}

export async function getApplicationNetworkID(applicationName: string, docker: Dockerode) {
  const networks = await docker.listNetworks();
  const appNetwork = getNetworkByName(networks, `${applicationName}-network`);

  if (appNetwork) {
    return appNetwork.Id;
  }

  const network = await docker.createNetwork({
    Name: `${applicationName}-network`,
    Driver: "overlay",
    CheckDuplicate: true,
    IPAM: {
      Driver: "default",
    },
  });

  return network.id;
}

interface CreateGreenService {
  blueService: Dockerode.Service;
  docker: Dockerode;
}

export async function createGreenService({ blueService: { Spec }, docker }: CreateGreenService) {
  if (!Spec) {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: "Running application service specification not found, we can't create green service.",
    });
  }

  const newServieName = `${Spec.Name}-${Date.now()}`;
  Spec.Name = newServieName;

  Spec.Labels = {
    ...Spec.Labels,
    [`traefik.http.routers.${Spec.Name}.priority`]: "0",
  };

  Spec.UpdateConfig = {
    Parallelism: 1,
    Delay: 10000,
    FailureAction: "rollback",
    Order: "stop-first",
  };

  const greenService = await docker.createService(Spec)
    .catch((error) => {
      throw new DeploymentError({
        name: "DEPLOYMENT_APP_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error occurred while creating green service.",
      });
    });

  return greenService;
}

export async function getBlueServiceSpecByApplicationName(applicationName: string, docker: Dockerode) {
  const appServices = await docker.listServices({ filters: { name: [applicationName] } });
  if (appServices.length === 0) {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: "Running application service not found, we can't get blue service.",
    });
  }
  return appServices[0];
}

function getNetworkByName(networks: Dockerode.NetworkInspectInfo[], networkName: string) {
  return networks.find(network => network.Name === networkName);
}
