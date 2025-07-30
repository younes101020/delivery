import { setupServer } from "msw/node";

import sseDeploymentLogsHandlers from "@/app/api/sse-proxy/deployments/logs/[event]/mocks/handlers";

export const server = setupServer(...sseDeploymentLogsHandlers);
