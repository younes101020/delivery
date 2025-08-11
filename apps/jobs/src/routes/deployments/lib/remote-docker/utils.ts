import { DeploymentError } from "@/lib/error";
import { getSwarmServicesByName } from "@/lib/remote-docker/utils";

export async function synchroniseApplicationServiceWithLocalImage(targetApplicationServiceName: string) {
  const applicationServices = await getSwarmServicesByName([targetApplicationServiceName])
    .catch((error) => {
      throw new DeploymentError({
        name: "DEPLOYMENT_APP_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error occurred while fetching the application service.",
      });
    });

  const applicationService = applicationServices[0];
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
