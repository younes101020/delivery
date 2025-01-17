import { unstable_cacheTag } from "next/cache";

import { client } from "../http";

export async function getApplicationById(id: string) {
  "use cache";
  unstable_cacheTag(`application-${id}`);
  const response = await client.applications[":id"].$get({
    param: {
      id,
    },
  });
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}

export async function getApplicationSreenshotUrl(
  applicationId: number,
  applicationUrl: string = "https://facebook.com",
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

export async function getApplications() {
  const response = await client.applications.$get();
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}
