import { DeploymentError } from "@/lib/error";
import { getApplicationService } from "@/routes/applications/lib/remote-docker/utils";

import { NO_APPLICATION_SERVICE_ERROR_MESSAGE } from "./const";

export async function synchroniseApplicationServiceWithLocalImage(targetApplicationServiceName: string) {
  const applicationService = await getApplicationService({ name: [targetApplicationServiceName] });

  if (!applicationService) {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: NO_APPLICATION_SERVICE_ERROR_MESSAGE,
    });
  }

  await applicationService.update({
    ...applicationService.Spec,
    TaskTemplate: {
      ...applicationService.Spec?.TaskTemplate,
      ForceUpdate: 1,
    },
  }).catch((error) => {
    throw new DeploymentError({
      name: "DEPLOYMENT_APP_ERROR",
      message: error instanceof Error ? error.message : "Unexpected error occurred while updating the service.",
    });
  });
}
