import { http } from "msw";

import { env } from "@/env";

import { isLatestVersionResolver, updateVersionResolver } from "./resolvers";

const DELIVERY_VERSION_URL = new URL("/version", env.JOBS_API_BASEURL).toString();
export const TEST_DELIVERY_VERSION_URL = new URL("/api/version", env.WEB_BASE_URL).toString();

export default [
  http.get(DELIVERY_VERSION_URL, isLatestVersionResolver),
  http.get(TEST_DELIVERY_VERSION_URL, isLatestVersionResolver),
  http.put(DELIVERY_VERSION_URL, updateVersionResolver),
  http.put(TEST_DELIVERY_VERSION_URL, updateVersionResolver),
];
