import { http } from "msw";

import { env } from "@/env";

import { getVersionResolver, updateVersionResolver } from "./resolvers";

/*
  In test environment, we mock the web API version endpoint
  Whereas in development, we mock the jobs API version endpoint.
*/
export const DELIVERY_VERSION_URL = env.NODE_ENV === "test"
  ? new URL("/api/version", env.WEB_BASE_URL).toString()
  : new URL("/version", env.JOBS_API_BASEURL).toString();

export default [
  http.get(DELIVERY_VERSION_URL, getVersionResolver),
  http.put(DELIVERY_VERSION_URL, updateVersionResolver),
];
