import "server-only";

import { client } from "@/app/_lib/client-http";
import { getSession } from "@/app/_lib/session";

export async function getTeamForUser() {
  const sessionData = await getSession();
  if (!sessionData || new Date(sessionData.expires) < new Date()) {
    return null;
  }
  const http = await client();
  const response = await http.users[":id"].team.$get({
    param: {
      id: sessionData.user.id.toString(),
    },
  });

  if (response.status !== 200) {
    return null;
  }
  const team = response.json();

  return team;
}

export type TeamForUser = Awaited<ReturnType<typeof getTeamForUser>>;
