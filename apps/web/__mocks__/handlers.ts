import deliveryVersionHandlers from "@/app/__mocks__/handlers";
import applicationListHandlers from "@/app/api/(resources)/applications/__mocks__/handlers";
import sseDeploymentLogsHandlers from "@/app/api/sse-proxy/deployments/logs/[event]/__mocks__/handlers";
import teamHandlers from "@/app/api/team/__mocks__/handlers";

export const handlers = [
  ...sseDeploymentLogsHandlers,
  ...deliveryVersionHandlers,
  ...teamHandlers,
  ...applicationListHandlers,
];
