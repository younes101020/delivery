import type Dockerode from "dockerode";

import type { PatchEnvironmentVariablesSchema } from "@/db/dto";
import type { ServicesDto } from "@/db/dto/services.dto";

import { withDocker } from "@/lib/remote-docker/middleware";
import { getSwarmServiceByName, toServiceSpec } from "@/lib/remote-docker/utils";

export const listApplicationServicesSpec = withDocker<ServicesDto[], Dockerode.ServiceListOptions | undefined>(
  async (docker, opts) => {
    const inputFilters = opts && typeof opts.filters === "object" ? opts.filters : {};
    const appServices = await docker.listServices({ filters: { label: ["resource=application"], ...inputFilters } });
    const servicesSpec = await Promise.all(appServices.map(toServiceSpec));
    return servicesSpec;
  },
);
export const getApplicationNetworkID = withDocker<string, string>(async (docker, applicationName) => {
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
});

function getNetworkByName(networks: Dockerode.NetworkInspectInfo[], networkName: string) {
  return networks.find(network => network.Name === networkName);
}

interface PatchApplication {
  serviceName: string;
  envs?: PatchEnvironmentVariablesSchema[];
  port?: number;
}

export const patchApplicationService = withDocker<void, PatchApplication>(
  async (docker, ctx) => {
    const appServiceMetadata = await getSwarmServiceByName(ctx?.serviceName);
    const appService = docker.getService(appServiceMetadata.ID);

    const appServiceInspect = await appService.inspect();
    const appServiceSpec = appServiceInspect.Spec;

    if (ctx?.envs) {
      const envs = ctx?.envs.map(env => `${env.key}=${env.value}`);

      let currentEnv = [];
      if (appServiceSpec.TaskTemplate.ContainerSpec.Env) {
        currentEnv = appServiceSpec.TaskTemplate.ContainerSpec.Env;
      }

      currentEnv.push(...envs);
      appServiceSpec.TaskTemplate.ContainerSpec.Env = currentEnv;
    }

    if (ctx?.port) {
      let currentLabels: Record<string, string> = {};
      if (appServiceSpec.Labels) {
        currentLabels = appServiceSpec.Labels;
      }
      currentLabels[`traefik.http.services.${ctx?.serviceName}.loadbalancer.server.port`] = ctx?.port.toString();
      appServiceSpec.Labels = currentLabels;
    }

    await appService.update({
      ...appServiceSpec,
      version: Number.parseInt(appServiceInspect.Version.Index),
    });
  },
);
