import { toServiceSpec } from "@/lib/remote-docker/utils";
import { APPLICATION_INSTANCE_REPLICAS } from "@/routes/applications/lib/remote-docker/const";

import { withApplicationsServices } from "./service-middleware";

export const startApplicationService = withApplicationsServices(async (appServices) => {
  await appServices.update({ Spec: { Mode: { Replicated: { Replicas: APPLICATION_INSTANCE_REPLICAS } } } });
});

export const stopApplicationService = withApplicationsServices(async (appService) => {
  await appService.update({ Spec: { Mode: { Replicated: { Replicas: 0 } } } });
});

export const removeApplicationService = withApplicationsServices(async (appService) => {
  await appService.remove();
});

export const getApplicationServiceSpec = withApplicationsServices(async (appServices) => {
  const appService = toApplicationServiceSpec(appServices);
  return appService;
});
