import { createRouter } from "@/lib/create-app";

import * as handlers from "./screenshots.handlers";
import * as routes from "./screenshots.routes";

const router = createRouter().openapi(routes.getImageUrl, handlers.getImageUrl);

export default router;
