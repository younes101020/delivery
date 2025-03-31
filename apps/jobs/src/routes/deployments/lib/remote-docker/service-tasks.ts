import type Dockerode from "dockerode";

import { DeploymentError } from "@/lib/error";
import { withDocker } from "@/lib/remote-docker/middleware";
import { getApplicationNetworkID } from "@/routes/applications/lib/remote-docker/utils";

import { MISSING_DEPLOYMENT_DATA_ERROR_MESSAGE } from "./const";
import { createApplicationServiceSpec } from "./manifest";
import { synchroniseApplicationServiceWithLocalImage } from "./utils";

interface DefineApplicationServiceTask {
  isRedeploy: boolean;
  name: string;
  fqdn: string;
  port: number;
}

export const defineApplicationServiceTask = withDocker<void | Dockerode.Service | DeploymentError, DefineApplicationServiceTask>(
  async (docker, input) => {
    if (!input) {
      throw new DeploymentError({
        name: "DEPLOYMENT_APP_ERROR",
        message: MISSING_DEPLOYMENT_DATA_ERROR_MESSAGE,
      });
    }
    const { name, isRedeploy, fqdn, port } = input;
    const networkId = await getApplicationNetworkID(name);

    if (isRedeploy)
      return await synchroniseApplicationServiceWithLocalImage(name);

    const appServiceSpec = createApplicationServiceSpec({
      applicationName: name,
      image: name,
      fqdn,
      port,
      networkId,
    });

    return await docker.createService(appServiceSpec).catch((error) => {
      throw new DeploymentError({
        name: "DEPLOYMENT_APP_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error occurred while creating the application service.",
      });
    });
  },
);
