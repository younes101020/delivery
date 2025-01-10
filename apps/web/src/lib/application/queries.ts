import { client } from "../http";

export async function getApplicationById(id: string) {
  const response = await client.applications[":id"].$get({
    param: {
      id,
    },
  });
  if (response.status !== 200) {
    return null;
  }
  const result = await response.json();
  return result;
}
