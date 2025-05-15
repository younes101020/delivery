import { createRouter } from "@/lib/create-app";

import * as handlers from "./server-config.handler";
import * as routes from "./server-config.route";

const router = createRouter()
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.getFirst, handlers.getFirst)
  .openapi(routes.patchInstance, handlers.patchInstance)
  .openapi(routes.getInstance, handlers.getInstance);

export default router;
