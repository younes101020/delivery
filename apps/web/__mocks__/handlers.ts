import sseDeploymentLogsHandlers from "@/app/api/sse-proxy/deployments/logs/[event]/__mocks__/handlers";
import deliveryVersionHandlers from "@/app/api/version/__mocks__/handlers";

export const handlers = [
  ...sseDeploymentLogsHandlers,
  ...deliveryVersionHandlers,
];
