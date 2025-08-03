import { setupServer } from "msw/node";

import sseDeploymentLogsHandlers from "@/app/api/sse-proxy/deployments/logs/[event]/__mocks__/handlers";
import deliveryVersionHandlers from "@/app/api/version/__mocks__/handlers";

const handlers = [
  ...sseDeploymentLogsHandlers,
  ...deliveryVersionHandlers,
];

export const server = setupServer(...handlers);
