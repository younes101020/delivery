import type Dockerode from "dockerode";

import { DeploymentError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";

import { withApplicationsServices } from "./middleware";

export function toApplicationServiceSpec(service: Dockerode.Service) {
  const taskTemplate = service.Spec?.TaskTemplate as Dockerode.ContainerTaskSpec;
  const appInstanceCount = service.Spec?.Mode?.Replicated?.Replicas ?? 0;
  const name = service.Spec?.Name ?? "Anonymous application";
  return {
    id: service.id,
    name,
    image: taskTemplate.ContainerSpec?.Image,
    isActive: appInstanceCount > 0,
    isProcessing: false,
    createdAt: service.CreatedAt!,
  };
}

export const getApplicationService = withApplicationsServices(async appServices => appServices);

export async function listApplicationServicesSpec(opts?: Dockerode.ServiceListOptions) {
  const docker = await getDocker();
  const inputFilters = typeof opts?.filters === "object" ? opts.filters : {};
  const appServices = await docker.listServices({ filters: { label: ["resource=application"], ...inputFilters } });
  return appServices.map(toApplicationServiceSpec);
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

export async function synchroniseApplicationServiceWithLocalImage(targetApplicationServiceName: string) {
  const applicationService = await getApplicationService({ name: [targetApplicationServiceName] });

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
