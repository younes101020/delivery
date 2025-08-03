import { http, passthrough } from "msw";
import { setupServer } from "msw/node";

import versionHandlers from "../../src/routes/version/__tests__/__mocks__/handlers";

export const server = setupServer(
  ...versionHandlers,
  http.all("*", () => {
    return passthrough();
  }),
);
