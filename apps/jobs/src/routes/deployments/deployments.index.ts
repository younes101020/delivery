import { createRouter } from "@/lib/create-app";

import * as handlers from "./deployments.handler";
import * as routes from "./deployments.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.streamLog, handlers.streamLog);

export default router;
