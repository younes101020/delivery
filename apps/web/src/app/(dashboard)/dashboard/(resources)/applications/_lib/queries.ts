import "server-only";
import { unstable_cacheTag } from "next/cache";

import { client } from "@/app/_lib/client-http";

export async function getApplicationByName(name: string) {
  "use cache";
  unstable_cacheTag(`application-${name}`);
  const response = await client.applications[":slug"].$get({
    param: {
      slug: name,
    },
  });
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}

export async function getApplicationSreenshotUrl(
  applicationName: string,
  applicationUrl: string = "https://facebook.com",
) {
  const response = await client.screenshots.$post({
    json: {
      applicationName,
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
