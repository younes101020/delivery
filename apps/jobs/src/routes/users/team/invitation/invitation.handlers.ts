import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { ApproveTeamInvitation, CreateTeamInvitation, GetTeamInvitation } from "./invitation.routes";

import { approveInvitation, createInvitationIntoTeam, getTeamInvitationByTeamId } from "./lib/queries";

export const getTeamInvitation: AppRouteHandler<GetTeamInvitation> = async (c) => {
  const { id: teamId } = c.req.valid("param");
  const { status } = c.req.valid("query");

  const teamInvitations = await getTeamInvitationByTeamId({ teamId, status });

  return c.json(teamInvitations, HttpStatusCodes.OK);
};

export const createTeamInvitation: AppRouteHandler<CreateTeamInvitation> = async (c) => {
  const { id: teamId } = c.req.valid("param");
  const invitation = c.req.valid("json");

  const [createdInvitation] = await createInvitationIntoTeam({ teamId, invitation });

  return c.json(createdInvitation, HttpStatusCodes.OK);
};

export const approveTeamInvitation: AppRouteHandler<ApproveTeamInvitation> = async (c) => {
  const { id: invitationId } = c.req.valid("param");
  const { invitedUserEmail } = c.req.valid("json");

  const updatedInvitation = await approveInvitation({
    invitationId,
    invitedUserEmail,
  });

  return c.json(updatedInvitation, HttpStatusCodes.OK);
};
