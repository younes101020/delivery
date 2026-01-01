import { http } from "msw";

import { env } from "@/env";

import { getAppEventResolver, getAppListResolver } from "./resolvers";

const APPLICATION_LIST_URL = new URL("/applications", env.JOBS_API_BASEURL).toString();

/*
  in development, we mock backend-for-frontend api route handler response
  in test, we mock browser fetch (eventsource) response
*/
const APPLICATION_EVENT_URL = env.NODE_ENV === "test"
  ? new URL("/api/sse-proxy/applications", env.WEB_BASE_URL).toString()
  : new URL("/applications/ongoing", env.JOBS_API_BASEURL).toString();

export default [
  // Applications list
  http.get(APPLICATION_LIST_URL, getAppListResolver),
  // Application events stream
  http.get(APPLICATION_EVENT_URL, getAppEventResolver),
];
