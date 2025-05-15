import type { ContainerCreateOptions, ContainerInspectInfo } from "dockerode";

export interface UpdatedWebInstanceOptions {
  name: string;
  domainName: string;
}

export interface CreateDeliveryWebConfigContainerWithHostnameLabelObjectOptions {
  traefikLabel: ContainerCreateOptions["Labels"];
  webContainerName: ContainerCreateOptions["name"];
  currentDeliveryWebConfigContainer: ContainerInspectInfo["Config"];
}
