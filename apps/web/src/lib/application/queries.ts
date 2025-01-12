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

export async function getApplicationSreenshotUrl(
  applicationId: number,
  applicationUrl: string = "https://habbo.com",
) {
  const response = await client.screenshots.$post({
    json: {
      applicationId,
      url: applicationUrl,
    },
  });
  if (response.status !== 200) {
    return null;
  }
  const { imageUrl } = await response.json();
  return imageUrl;
}
