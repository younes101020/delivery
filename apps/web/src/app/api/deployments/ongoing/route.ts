import { getCurrentDeploymentsState } from "@/app/(dashboard)/dashboard/deployments/_lib/queries";

export async function GET() {
  const previousDeployments = await getCurrentDeploymentsState();
  return Response.json(previousDeployments);
}
