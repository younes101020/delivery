import { getSession } from "./auth/session";
import { client } from "./http";

export async function getUser() {
  const sessionData = await getSession();
  if (!sessionData || new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const response = await client.users[":id"].$get({
    param: {
      id: sessionData.user.id,
    },
  });
  if (response.status !== 200) {
    return null;
  }
  const user = response.json();

  return user;
}
