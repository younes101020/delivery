import { DeploymentError } from "@/lib/error";
import { getDocker } from "@/lib/remote-docker";
import { getApplicationNetworkID } from "@/routes/applications/lib/remote-docker/utils";

import { createApplicationServiceSpec } from "./manifest";
import { synchroniseApplicationServiceWithLocalImage } from "./utils";

interface DefineApplicationServiceTask {
  isRedeploy: boolean;
  name: string;
  fqdn: string;
  port: number;
}

export async function defineApplicationServiceTask({ isRedeploy, name, fqdn, port }: DefineApplicationServiceTask) {
  const docker = await getDocker();
  const networkId = await getApplicationNetworkID(name, docker);

  if (isRedeploy) {
    await synchroniseApplicationServiceWithLocalImage(name);
  }
  else {
    const appServiceSpec = createApplicationServiceSpec({
      applicationName: name,
      image: name,
      fqdn,
      port,
      networkId,
    });
    await docker.createService(appServiceSpec).catch((error) => {
      throw new DeploymentError({
        name: "DEPLOYMENT_APP_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error occurred while creating the application service.",
      });
    });
  }
}
