import { server } from "./server";

export function setupMocks() {
  // eslint-disable-next-line node/no-process-env
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    server.listen();
  }
}
