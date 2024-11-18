import { createRouter } from "@/lib/create-app";

import * as handlers from "./envvars.handlers";
import * as routes from "./envvars.routes";

const router = createRouter().openapi(routes.create, handlers.create);

export default router;
