import { createRouter } from "@/lib/create-app";

import * as handlers from "./onboarding.handler";
import * as routes from "./onboarding.route";

const router = createRouter().openapi(routes.patch, handlers.patch);

export default router;
