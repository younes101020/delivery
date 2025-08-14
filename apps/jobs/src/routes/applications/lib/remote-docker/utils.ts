import type Dockerode from "dockerode";

import type { PatchEnvironmentVariablesSchema } from "@/lib/dto";
import type { ServicesDto } from "@/lib/dto/services.dto";

import { withDocker } from "@/lib/remote-docker/middleware";
import { getSwarmServicesByName, toServiceSpec } from "@/lib/remote-docker/utils";

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
    Attachable: true,
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
  fqdn?: string;
}

export const patchApplicationService = withDocker<void, PatchApplication>(
  async (docker, ctx) => {
    const appServicesMetadata = await getSwarmServicesByName([ctx!.serviceName]);
    const appServiceMetadata = appServicesMetadata[0];

    const appService = docker.getService(appServiceMetadata.ID);

    const appServiceInspect = await appService.inspect();
    const appServiceSpec = appServiceInspect.Spec;

    if (ctx?.envs) {
      // slice the first and last character to remove quotes
      const envs = ctx?.envs.map(env => `${env.key}=${env.value?.slice(1, -1)}`);
      appServiceSpec.TaskTemplate.ContainerSpec.Env = envs;
    }

    let currentLabels: Record<string, string> = {};

    if (appServiceSpec.Labels) {
      currentLabels = appServiceSpec.Labels;
    }
    if (ctx?.port)
      currentLabels[`traefik.http.services.${ctx?.serviceName}.loadbalancer.server.port`] = ctx?.port.toString();

    if (ctx?.fqdn)
      currentLabels[`traefik.http.routers.${ctx?.serviceName}.rule`] = `Host(\`${ctx?.fqdn}\`)`;

    appServiceSpec.Labels = currentLabels;

    await appService.update({
      ...appServiceSpec,
      version: Number.parseInt(appServiceInspect.Version.Index),
    });
  },
);
