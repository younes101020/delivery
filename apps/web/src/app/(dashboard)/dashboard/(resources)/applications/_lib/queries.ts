import "server-only";

import { client } from "@/app/_lib/client-http";

type GetApplicationByNameParams = Promise<{ name: string }>;

export async function getApplicationByName(searchParams: GetApplicationByNameParams) {
  const { name } = await searchParams;
  return getCachedApplicationByName(name);
}

async function getCachedApplicationByName(name: string) {
  const response = await client.applications[":name"].$get({
    param: {
      name,
    },
  });
  if (response.status !== 200) {
    return null;
  }
  return await response.json();
}

interface GetApplicationScreenshotParams {
  searchParams: Promise<{ name: string }>;
  applicationUrl?: string;
}

export async function getApplicationSreenshotUrl({
  searchParams,
  applicationUrl = "https://facebook.com",
}: GetApplicationScreenshotParams) {
  const { name } = await searchParams;
  const response = await client.screenshots.$post({
    json: {
      applicationName: name,
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

export type Application = Awaited<ReturnType<typeof getApplicationByName>>;
export type ApplicationScreenshotImageSource = Awaited<ReturnType<typeof getApplicationSreenshotUrl>>;
