import console from "console";
import { server } from "./node";
import { env } from "@/env";

export function enableHTTPMocks() {
    const enableHTTPMocking = env.NODE_ENV === "development";
    if (enableHTTPMocking) {
      console.warn("HTTP mocking enabled for development or test environment");
      server.listen();
    };
}