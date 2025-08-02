import { http, HttpResponse, passthrough } from "msw";

import { env } from "@/env";

const DEPLOYMENT_LOGS_URL = `${env.WEB_BASE_URL}/api/version`;

export default [
  http.get(DEPLOYMENT_LOGS_URL, () => {
    return HttpResponse.json({ name: "hello world" });
  }),
  http.all("*", () => {
    return passthrough();
  }),
];
