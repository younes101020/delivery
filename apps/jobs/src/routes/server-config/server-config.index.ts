import { createRouter } from "@/lib/create-app";

import * as handlers from "./server-config.handler";
import * as routes from "./server-config.route";

const router = createRouter()
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.getFirst, handlers.getFirst)
  .openapi(routes.patchWebService, handlers.patchWebServiceHandler)
  .openapi(routes.getWebService, handlers.getWebServiceHandler);

export default router;
