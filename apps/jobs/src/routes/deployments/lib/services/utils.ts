import type Dockerode from "dockerode";

import { DeploymentError } from "@/lib/error";
import { getApplicationServiceByName } from "@/lib/remote-docker/utils";

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

export async function getBlueServiceSpecByApplicationName(applicationName: string, docker: Dockerode) {
  const blueServices = await docker.listServices({
    filters: {
      label: ["deployment=blue"],
    },
  });
  const blueAppService = blueServices.find(blueService => blueService.Spec?.Name?.includes(applicationName));

  if (!blueAppService) {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: "Running application service not found, we can't get blue service.",
    });
  }

  return blueAppService;
}

export async function synchroniseApplicationServiceWithLocalImage(targetApplicationServiceName: string, docker: Dockerode) {
  const applicationService = await getApplicationServiceByName(targetApplicationServiceName, docker);

  if (!applicationService) {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: "Service not found, we can't update the service.",
    });
  }

  await applicationService.update({
    ...applicationService.Spec,
    TaskTemplate: {
      ...applicationService.Spec?.TaskTemplate,
      ForceUpdate: 1,
    },
  }).catch((error) => {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error occurred while updating the service.",
    });
  });
}

function getNetworkByName(networks: Dockerode.NetworkInspectInfo[], networkName: string) {
  return networks.find(network => network.Name === networkName);
}
