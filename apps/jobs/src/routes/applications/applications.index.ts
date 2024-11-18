import { createRouter } from "@/lib/create-app";

import * as handlers from "./applications.handlers";
import * as routes from "./applications.routes";

const router = createRouter().openapi(routes.create, handlers.create);

export default router;
