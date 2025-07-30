import { delay, http, HttpResponse } from "msw";

import { env } from "@/env";

import { deploymentData } from "./data";

const encoder = new TextEncoder();

export const handlers = [
  http.get(`${env.JOBS_API_BASEURL}/deployments/logs/*`, () => {
    const deploymentStream = new ReadableStream({
      async start(controller) {
        for (const chunk of deploymentData) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          await delay(4000);
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
