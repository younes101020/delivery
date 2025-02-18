import { createRouter } from "@/lib/create-app";

import * as handlers from "./databases.handlers";
import * as routes from "./databases.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create);

export default router;
