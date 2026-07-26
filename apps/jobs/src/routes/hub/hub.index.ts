import { createRouter } from "@/lib/create-app";

import * as handlers from "./hub.handlers";
import * as routes from "./hub.routes";

const router = createRouter()
  .openapi(routes.pull, handlers.pull)
  .openapi(routes.startStack, handlers.startStack)
  .openapi(routes.listStacks, handlers.listStacks)
  .openapi(routes.upsertStackService, handlers.upsertStackService);

export default router;
