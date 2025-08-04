import { delay, http, HttpResponse } from "msw";

import { env } from "@/env";

import { deploymentData } from "./data";

const encoder = new TextEncoder();

/*
  in development, we mock backend-for-frontend api route handler response
  in test, we mock browser fetch (eventsource) response
*/
const DELIVERY_DEPLOY_LOGS_URL = env.NODE_ENV === "test"
  ? new URL("/api/sse-proxy/deployments/logs", env.WEB_BASE_URL).toString()
  : new URL("/deployments/logs", env.JOBS_API_BASEURL).toString();

export default [
  http.get(`${DELIVERY_DEPLOY_LOGS_URL}/:appName`, () => {
    const deploymentStream = new ReadableStream({
      async start(controller) {
        for (const chunk of deploymentData) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          await delay(1000);
        }
        controller.close();
      },
    });

    return new HttpResponse(deploymentStream, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  }),
];
