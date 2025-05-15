import type { ContainerCreateOptions, ContainerInspectInfo, ContainerListOptions } from "dockerode";

import { withDocker } from "@/lib/remote-docker/utils";

export const getDeliveryWebContainerInfo = withDocker(
  async (docker) => {
    const deliveryReverseProxyContainerLabel: ContainerListOptions["filters"] = {
      label: ["resource=reverse-proxy:delivery"],
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

export function createDeliveryWebConfigContainerWithHostnameLabel(
  currentDeliveryWebConfigContainer: ContainerInspectInfo["Config"],
  hostNameLabels: ContainerCreateOptions["Labels"],
): ContainerCreateOptions {
  return {
    ...currentDeliveryWebConfigContainer,
    Labels: hostNameLabels,
  };
}
