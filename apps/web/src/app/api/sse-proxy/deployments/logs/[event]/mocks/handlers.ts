import { delay, http, HttpResponse, passthrough } from "msw";

import { env } from "@/env";

import { deploymentData } from "./data";

const encoder = new TextEncoder();

export default [
  http.get(`${env.JOBS_API_BASEURL}/deployments/logs/*`, () => {
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
  http.all("*", () => {
    return passthrough();
  }),
];
