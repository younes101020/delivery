import { createRouter } from "@/lib/create-app";

import * as handlers from "./hub.handlers";
import * as routes from "./hub.routes";

const router = createRouter()
  .openapi(routes.pull, handlers.pull);

export default router;
