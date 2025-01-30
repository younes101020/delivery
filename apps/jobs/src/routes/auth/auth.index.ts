import { createRouter } from "@/lib/create-app";

import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

const router = createRouter().openapi(routes.verify, handlers.verify).openapi(routes.register, handlers.register);

export default router;
