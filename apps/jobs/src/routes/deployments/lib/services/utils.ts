import type Dockerode from "dockerode";

import { getDocker } from "@/lib/remote-docker";

export async function deleteAppServiceByName(applicationName: string) {
  const docker = await getDocker();
  const appsServices = await docker.listServices({ filters: { label: ["resource=application"] } });
  const appService = appsServices.find(service => service.Spec?.Name === applicationName);
  return await appService?.remove();
}

export async function getApplicationNetworkID(applicationName: string) {
  const docker = await getDocker();

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

function getNetworkByName(networks: Dockerode.NetworkInspectInfo[], networkName: string) {
  return networks.find(network => network.Name === networkName);
}
