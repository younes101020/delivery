import { http, HttpResponse, passthrough } from "msw";

import { env } from "@/env";

const DELIVERY_VERSION_URL = env.NODE_ENV === "test"
  ? `${env.WEB_BASE_URL}/api/version`
  : `${env.JOBS_API_BASEURL}/deployments/logs/*`;

export default [
  http.get(DELIVERY_VERSION_URL, () => {
    return HttpResponse.json({ name: "hello world" });
  }),
  http.all("*", () => {
    return passthrough();
  }),
];
