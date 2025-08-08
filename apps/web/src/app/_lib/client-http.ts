import "server-only";
import { hcWithType } from "@delivery/jobs/hc";
import { cookies } from "next/headers";

import { env } from "@/env";

export async function client() {
  const cookieStore = await cookies();
  const onboardingCookie = cookieStore.get("skiponboarding");
  const sessionCookie = cookieStore.get("session");

  const cookieString = [
    onboardingCookie && `${onboardingCookie.name}=${onboardingCookie.value}`,
    sessionCookie && `${sessionCookie.name}=${sessionCookie.value}`,
  ]
    .filter(Boolean)
    .join("; ");

  return hcWithType(`${env.JOBS_API_BASEURL}`, {
    headers: {
      Authorization: `Bearer ${env.JOBS_BEARER_TOKEN}`,
      Cookie: cookieString,
    },
    init: {
      credentials: "include",
    },
  });
}
