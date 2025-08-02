import { getDeliveryVersionInfo } from "@/app/_lib/jobs/queries";

export async function GET() {
  const version = await getDeliveryVersionInfo();
  return Response.json(version);
}
