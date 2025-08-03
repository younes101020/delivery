import { http, HttpResponse } from "msw";

import { env } from "@/env";

const DELIVERY_VERSION_URL = new URL("/version", env.JOBS_API_BASEURL).toString();

export default [
  http.get(DELIVERY_VERSION_URL, () => {
    return HttpResponse.json({
      version: "1.0.0",
      imageDigest: "sha256:1234567890abcdef",
      isLatest: true,
    });
  }),
];
