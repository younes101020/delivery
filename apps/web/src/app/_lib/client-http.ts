import "server-only";
import { hcWithType } from "@delivery/jobs/hc";
import { cookies } from "next/headers";

import { env } from "@/env";

export async function client() {
  const cookieStore = await cookies();
  const onboardingCookie = cookieStore.get("skiponboarding");

  return hcWithType(`${env.JOBS_API_BASEURL}`, {
    headers: {
      Authorization: `Bearer ${env.JOBS_BEARER_TOKEN}`,
      Cookie: onboardingCookie ? `${onboardingCookie.name}=${onboardingCookie.value}` : "",
    },
    init: {
      credentials: "include",
    },
  });
}
