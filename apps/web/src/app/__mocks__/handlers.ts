import { http } from "msw";

import { env } from "@/env";

import { isLatestVersionResolver, updateVersionResolver } from "./resolvers";

/*
  In test environment, we mock the web API version endpoint
  Whereas in development, we mock the jobs API version endpoint.
*/
const DELIVERY_VERSION_URL = env.NODE_ENV === "test"
  ? new URL("/api/version", env.WEB_BASE_URL).toString()
  : new URL("/version", env.JOBS_API_BASEURL).toString();

export default [
  http.get(DELIVERY_VERSION_URL, isLatestVersionResolver),
  http.put(DELIVERY_VERSION_URL, updateVersionResolver),
];
