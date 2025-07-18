import "server-only";

import { client } from "@/app/_lib/client-http";

type GetApplicationByNameParams = Promise<{ name: string }>;

export async function getApplicationByName(params: GetApplicationByNameParams) {
  const { name } = await params;

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
  params: Promise<{ name: string }>;
}

export async function getApplicationSreenshotUrl({
  params,
}: GetApplicationScreenshotParams) {
  const { name } = await params;
  const appDetails = await getApplicationByName(params);
  const response = await client.screenshots.$post({
    json: {
      applicationName: name,
      url: appDetails?.fqdn || "",
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
