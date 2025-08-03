import { server } from "./server";

  // eslint-disable-next-line node/no-process-env
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    server.listen();
  }
