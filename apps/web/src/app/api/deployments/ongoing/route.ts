import { getCurrentDeploymentsState } from "@/app/(dashboard)/dashboard/deployments/_lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const previousDeployments = await getCurrentDeploymentsState();
  return Response.json(previousDeployments);
}
