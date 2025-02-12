import { createRouter } from "@/lib/create-app";

import * as handlers from "./deployments.handler";
import * as routes from "./deployments.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.streamPreview, handlers.streamPreview)
  .openapi(routes.streamLog, handlers.streamLog)
  .openapi(routes.retryJob, handlers.retryJob)
  .openapi(routes.getCurrentDeploymentStep, handlers.getCurrentDeploymentsStep)
  .openapi(routes.streamCurrentDeploymentCount, handlers.streamCurrentDeploymentsCount)
  .openapi(routes.cancelJob, handlers.cancelJob);

export default router;
