import { setupServer } from "msw/node";

import sseDeploymentLogsHandlers from "@/app/api/sse-proxy/deployments/logs/[event]/__mocks__/handlers";

export const server = setupServer(...sseDeploymentLogsHandlers);
