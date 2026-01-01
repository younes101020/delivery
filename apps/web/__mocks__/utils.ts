import console from "node:console";

import { env } from "@/env";

import { server } from "./node";

export function enableHTTPMocks() {
  const enableHTTPMocking = env.NODE_ENV === "development";
  if (enableHTTPMocking) {
    console.warn("HTTP mocking enabled for development");
    server.listen();
  };
}
