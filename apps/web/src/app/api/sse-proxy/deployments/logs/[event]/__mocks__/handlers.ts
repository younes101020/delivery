import { delay, http, HttpResponse } from "msw";

import { env } from "@/env";

import { deploymentData } from "./data";

const encoder = new TextEncoder();

/*
  in development, we mock backend-for-frontend api route handler response
  in test, we mock browser fetch (eventsource) response
*/
const DEPLOYMENT_LOGS_URL = env.NODE_ENV === "test"
  ? `${env.WEB_BASE_URL}/api/sse-proxy/deployments/logs/*`
  : `${env.JOBS_API_BASEURL}/deployments/logs/*`;

export default [
  http.get(DEPLOYMENT_LOGS_URL, () => {
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
