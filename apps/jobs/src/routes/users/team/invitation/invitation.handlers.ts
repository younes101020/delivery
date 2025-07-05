import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { GetTeamInvitation } from "./invitation.routes";

import { getTeamInvitationByTeamId } from "./lib/queries";

export const getTeamInvitation: AppRouteHandler<GetTeamInvitation> = async (c) => {
  const { id: teamId } = c.req.valid("param");
  const { status } = c.req.valid("query");

  const teamInvitations = await getTeamInvitationByTeamId({ teamId, status });

  return c.json(teamInvitations, HttpStatusCodes.OK);
};
