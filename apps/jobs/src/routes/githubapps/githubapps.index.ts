import { createRouter } from "@/lib/create-app";

import * as handlers from "./githubapps.handlers";
import * as routes from "./githubapps.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne);

export default router;