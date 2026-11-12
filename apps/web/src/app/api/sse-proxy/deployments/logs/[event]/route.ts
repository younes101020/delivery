import { apiHandlers } from "@/app/_lib/api-handlers";

export async function GET(_: Request, { params }: { params: Promise<{ event: string }> }) {
  return apiHandlers.getDeploymentLogs(_, { params });
}
