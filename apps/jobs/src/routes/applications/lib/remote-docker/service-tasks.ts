import { withSwarmService } from "@/lib/remote-docker/middleware";
import { toServiceSpec } from "@/lib/remote-docker/utils";
import { APPLICATION_INSTANCE_REPLICAS } from "@/routes/applications/lib/remote-docker/const";

export const startApplicationService = withSwarmService(async (appServices) => {
  const currentServiceSpec = await appServices.inspect();
  currentServiceSpec.Spec.Mode.Replicated.Replicas = APPLICATION_INSTANCE_REPLICAS;
  await appServices.update(
    {
      ...currentServiceSpec.Spec,
      version: Number.parseInt(currentServiceSpec.Version.Index),
    },
  );
});

export const stopApplicationService = withSwarmService(async (appService) => {
  const currentServiceSpec = await appService.inspect();
  currentServiceSpec.Spec.Mode.Replicated.Replicas = 0;
  await appService.update(
    {
      ...currentServiceSpec.Spec,
      version: Number.parseInt(currentServiceSpec.Version.Index),
    },
  );
});

export const removeApplicationService = withSwarmService(async (appService) => {
  await appService.remove();
});

export const getApplicationServiceSpec = withSwarmService(async (appService) => {
  const appSpec = await toServiceSpec(appService);
  return appSpec;
});
