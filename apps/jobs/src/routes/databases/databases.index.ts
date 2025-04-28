import { createRouter } from "@/lib/create-app";

import * as handlers from "./databases.handlers";
import * as routes from "./databases.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.stop, handlers.stop)
  .openapi(routes.start, handlers.start)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.list, handlers.list)
  .openapi(routes.streamCurrentDatabase, handlers.streamCurrentDatabase)
  .openapi(routes.link, handlers.link);

export default router;
