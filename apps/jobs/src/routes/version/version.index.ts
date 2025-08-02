import { createRouter } from "@/lib/create-app";

import * as handlers from "./version.handlers";
import * as routes from "./version.routes";

const router = createRouter().openapi(routes.getVersion, handlers.getVersion);

export default router;
