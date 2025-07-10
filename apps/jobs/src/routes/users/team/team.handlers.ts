import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import type { GetUserTeamRoute, RevokeUserTeamRoute } from "./team.routes";

import { getTeamForUserByUserId, revokeUserFromTeam } from "./lib/queries";

export const getUserTeam: AppRouteHandler<GetUserTeamRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const teamWithMembers = await getTeamForUserByUserId(id);

  if (!teamWithMembers) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(teamWithMembers, HttpStatusCodes.OK);
};

export const revokeUserTeam: AppRouteHandler<RevokeUserTeamRoute> = async (c) => {
  const { id: teamId } = c.req.valid("param");
  const { revokedUserId } = c.req.valid("json");

  await revokeUserFromTeam({ teamId, userId: revokedUserId });

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
