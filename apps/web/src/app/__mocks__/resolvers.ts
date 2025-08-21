import { delay, http, HttpResponse } from "msw";

import { server } from "@/../__mocks__/node";

import { DELIVERY_VERSION_URL } from "./handlers";

export function getVersionResolver() {
  return HttpResponse.json({
    version: "0.8.2",
    isLatest: true,
    isInProgress: false,
  });
}

export async function updateVersionResolver() {
  await delay(5000); // Simulate a delay for the update operation
  server.use(
    http.get(DELIVERY_VERSION_URL, () => HttpResponse.json({
      version: "1.0.0",
      isLatest: true,
    })),
  );
  return HttpResponse.json({
    version: "2.0.0",
  });
}
