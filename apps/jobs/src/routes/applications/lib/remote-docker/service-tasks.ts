import { withSwarmService } from "@/lib/remote-docker/middleware";
import { toServiceSpec } from "@/lib/remote-docker/utils";
import { APPLICATION_INSTANCE_REPLICAS } from "@/routes/applications/lib/remote-docker/const";

export const startApplicationService = withSwarmService(async (appServices) => {
  await appServices.update({ Spec: { Mode: { Replicated: { Replicas: APPLICATION_INSTANCE_REPLICAS } } } });
});

export const stopApplicationService = withSwarmService(async (appService) => {
  await appService.update({ Spec: { Mode: { Replicated: { Replicas: 0 } } } });
});

export const removeApplicationService = withSwarmService(async (appService) => {
  await appService.remove();
});

export const getApplicationServiceSpec = withSwarmService(async (appService) => {
  const appSpec = toServiceSpec(appService);
  return appSpec;
});
