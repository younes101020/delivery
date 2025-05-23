import { createRouter } from "@/lib/create-app";

import * as handlers from "./applications.handlers";
import * as routes from "./applications.routes";

const router = createRouter()
  .openapi(routes.streamCurrentApplication, handlers.streamCurrentApplication)
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.start, handlers.start)
  .openapi(routes.stop, handlers.stop);

export default router;
