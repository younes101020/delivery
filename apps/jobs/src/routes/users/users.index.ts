import { createRouter } from "@/lib/create-app";

import * as userhandlers from "./users.handlers";
import * as userroutes from "./users.routes";

const router = createRouter()
  .openapi(userroutes.getOne, userhandlers.getOne)
  .openapi(userroutes.patch, userhandlers.patch);

export default router;
