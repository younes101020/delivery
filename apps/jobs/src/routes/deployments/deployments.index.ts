import { createRouter } from "@/lib/create-app";

import * as handlers from "./deployments.handler";
import * as routes from "./deployments.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.redeploy, handlers.redeploy)
  .openapi(routes.streamPreview, handlers.streamPreview)
  .openapi(routes.streamLog, handlers.streamLog)
  .openapi(routes.retryJob, handlers.retryJob)
  .openapi(routes.getCurrentDeploymentStep, handlers.getCurrentDeploymentsStep)
  .openapi(routes.streamCurrentDeploymentCount, handlers.streamCurrentDeploymentsCount)
  .openapi(routes.getPreviousDeploymentStep, handlers.getPreviousDeploymentStep);

export default router;
