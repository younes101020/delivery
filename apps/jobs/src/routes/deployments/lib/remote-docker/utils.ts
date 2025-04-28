import { DeploymentError } from "@/lib/error";
import { getSwarmServiceByName } from "@/lib/remote-docker/utils";

export async function synchroniseApplicationServiceWithLocalImage(targetApplicationServiceName: string) {
  const applicationService = await getSwarmServiceByName(targetApplicationServiceName)
    .catch((error) => {
      throw new DeploymentError({
        name: "DEPLOYMENT_APP_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error occurred while fetching the application service.",
      });
    });

  const currentServiceSpec = await applicationService.inspect();

  currentServiceSpec.Spec.TaskTemplate.ForceUpdate = 1;

  await applicationService.update({
    ...applicationService.Spec,
    version: Number.parseInt(currentServiceSpec.Version.Index),
  }).catch((error) => {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error occurred while updating the service.",
    });
  });
}
