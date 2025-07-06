import { createRouter } from "@/lib/create-app";

import * as teamInvitationhandlers from "./invitation.handlers";
import * as teamInvitationroutes from "./invitation.routes";

const router = createRouter()
  .openapi(teamInvitationroutes.getTeamInvitation, teamInvitationhandlers.getTeamInvitation)
  .openapi(teamInvitationroutes.createTeamInvitation, teamInvitationhandlers.createTeamInvitation);

export default router;
