import { createRouter } from "@/lib/create-app";

import * as teamhandlers from "./team.handlers";
import * as teamroutes from "./team.routes";

const router = createRouter()
  .openapi(teamroutes.getUserTeam, teamhandlers.getUserTeam)
  .openapi(teamroutes.revokeUserTeam, teamhandlers.revokeUserTeam);

export default router;
