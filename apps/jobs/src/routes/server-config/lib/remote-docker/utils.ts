import type { ContainerCreateOptions, ContainerListOptions } from "dockerode";

import { withDocker } from "@/lib/remote-docker/utils";

import type { GetServerWebServiceConfigSchema, PatchServerWebServiceConfigSchema } from "../dto/server-config.dto";
import type { CreateDeliveryWebConfigContainerWithHostnameLabelObjectOptions, UpdatedWebInstanceOptions } from "./types";

export const getDeliveryWebContainerInfo = withDocker(
  async (docker) => {
    const deliveryReverseProxyContainerLabel: ContainerListOptions["filters"] = {
      label: ["resource=delivery-web-instance"],
    };
    const matchingDeliveryReverseProxyContainer = await docker.listContainers({
      filters: deliveryReverseProxyContainerLabel,
    });

    if (!matchingDeliveryReverseProxyContainer || matchingDeliveryReverseProxyContainer.length === 0)
      throw new Error("Delivery reverse proxy not found");

    const deliveryReverseProxyContainers = matchingDeliveryReverseProxyContainer[0];

    return docker.getContainer(deliveryReverseProxyContainers.Id).inspect();
  },
);

export const checkIfContainerIsRunning = withDocker<boolean, { runningContainerId: string }>(
  async (docker, opts) => {
    if (!opts)
      throw new Error("Container ID is required");

    const { runningContainerId } = opts;

    const container = docker.getContainer(runningContainerId);
    const containerInfo = await container.inspect();

    return containerInfo.State.Running;
  },
);

interface RedeployContainerOptions {
  runningContainerId: string;
  containerCreateOptions: ContainerCreateOptions;
}

export const redeployContainerWithChanges = withDocker<string, RedeployContainerOptions>(
  async (docker, opts) => {
    if (!opts)
      throw new Error("Redeploy options are required");

    const { runningContainerId, containerCreateOptions } = opts;

    const isContainerRunning = await checkIfContainerIsRunning({ runningContainerId });

    if (isContainerRunning) {
      const container = docker.getContainer(runningContainerId);
      await container.stop();
      await container.remove();
    }

    const createdContainer = await docker.createContainer(containerCreateOptions);

    return createdContainer.id;
  },
);

export async function updateWebInstanceContainerConfiguration(opts: Partial<UpdatedWebInstanceOptions>) {
  const webInstanceContainer = await getDeliveryWebContainerInfo();

  const updatedWebContainerConfig = toWebContainerConfig({
    currentDeliveryWebConfigContainer: webInstanceContainer.Config,
    webContainerName: opts?.name,
    traefikLabel: {
      "traefik.http.routers.web.rule": `Host(\`${opts?.domainName}\`)`,
    },
  });

  return redeployContainerWithChanges({
    runningContainerId: webInstanceContainer.Id,
    containerCreateOptions: updatedWebContainerConfig,
  });
}

export function toWebContainerConfig(opts: CreateDeliveryWebConfigContainerWithHostnameLabelObjectOptions): ContainerCreateOptions {
  const { webContainerName, traefikLabel, currentDeliveryWebConfigContainer } = opts;
  return {
    ...currentDeliveryWebConfigContainer,
    name: webContainerName,
    Labels: traefikLabel,
  };
}

export async function getDeliveryWebInstanceName() {
  const instanceConfig = await getDeliveryWebContainerInfo();
  return instanceConfig.Name.slice(1); // Remove the leading slash
}

export const getWebService = withDocker<Omit<GetServerWebServiceConfigSchema, "fqdn">, void>(
  async (docker) => {
    const dbServices = await docker.listServices({ filters: { label: ["resource=delivery-web-instance"] } });
    const name = dbServices[0] && dbServices[0].Spec ? dbServices[0].Spec.Name! : "Anonymous";
    const serviceId = dbServices[0] ? dbServices[0].ID : "None";
    return {
      name,
      serviceId,
    };
  },
);

export const patchWebService = withDocker<void, PatchServerWebServiceConfigSchema & { serviceId: string }>(
  async (docker, ctx) => {
    const webService = docker.getService(ctx!.serviceId);

    const webServiceInspect = await webService.inspect();
    const webServiceSpec = webServiceInspect.Spec;

    if (ctx?.name)
      webServiceSpec.Name = ctx.name;

    if (ctx?.fqdn)
      webServiceSpec.Labels[`traefik.http.routers.${webServiceSpec.Name}.rule`] = `Host(\`${ctx.fqdn}\`)`;

    await webService.update({
      ...webServiceSpec,
      version: Number.parseInt(webServiceInspect.Version.Index),
    });
  },
);
