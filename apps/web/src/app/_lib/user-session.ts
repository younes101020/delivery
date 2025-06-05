import "server-only";

import { getClient } from "./client-http";
import { getSession } from "./session";

export async function getUser() {
  const sessionData = await getSession();
  if (!sessionData || new Date(sessionData.expires) < new Date()) {
    return null;
  }
  const client = getClient();
  const response = await client.users[":id"].$get({
    param: {
      id: sessionData.user.id.toString(),
    },
  });

  if (response.status !== 200) {
    return null;
  }
  const user = response.json();

  return user;
}
